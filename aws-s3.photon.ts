/**
 * AWS S3 - Cloud object storage operations
 *
 * Provides AWS S3 operations using the AWS SDK v3.
 * Supports object upload/download, bucket management, and presigned URLs.
 *
 * Common use cases:
 * - Object storage: "Upload file to bucket", "Download object from S3"
 * - File management: "List all files in bucket", "Delete old backups"
 * - Sharing: "Generate presigned URL for private object"
 *
 * Example: uploadObject({ bucket: "my-bucket", key: "file.txt", content: "Hello" })
 *
 * Configuration:
 * - accessKeyId: AWS access key ID (required)
 * - secretAccessKey: AWS secret access key (required)
 * - region: AWS region (default: us-east-1)
 *
 * @dependencies @aws-sdk/client-s3@^3.511.0, @aws-sdk/s3-request-presigner@^3.511.0
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default class AwsS3 {
  private s3: S3Client;
  private region: string;

  constructor(
    private accessKeyId: string,
    private secretAccessKey: string,
    region: string = 'us-east-1'
  ) {
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS S3 requires accessKeyId and secretAccessKey');
    }

    this.region = region;

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async onInitialize() {
    try {
      // Test connection by listing buckets
      await this.s3.send(new ListBucketsCommand({}));

      console.error('[aws-s3] ✅ Connected to AWS S3');
      console.error(`[aws-s3] Region: ${this.region}`);
    } catch (error: any) {
      console.error('[aws-s3] ❌ Connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Upload object to bucket
   * @param bucket Bucket name
   * @param key Object key (file path)
   * @param content Content to upload (string or base64)
   * @param contentType MIME type (optional, e.g., "text/plain", "image/png")
   * @param encoding Content encoding (optional, e.g., "base64" for binary files)
   */
  async upload(params: {
    bucket: string;
    key: string;
    content: string;
    contentType?: string;
    encoding?: string;
  }) {
    try {
      const body = params.encoding === 'base64'
        ? Buffer.from(params.content, 'base64')
        : params.content;

      const command = new PutObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
        Body: body,
        ContentType: params.contentType,
      });

      await this.s3.send(command);

      return {
        success: true,
        bucket: params.bucket,
        key: params.key,
        url: `https://${params.bucket}.s3.${this.region}.amazonaws.com/${params.key}`,
        message: 'Object uploaded successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Download object from bucket
   * @param bucket Bucket name
   * @param key Object key (file path)
   * @param encoding Return encoding (optional, "base64" for binary files)
   */
  async download(params: { bucket: string; key: string; encoding?: string }) {
    try {
      const command = new GetObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
      });

      const response = await this.s3.send(command);

      if (!response.Body) {
        return {
          success: false,
          error: 'Object body is empty',
        };
      }

      // Convert stream to string/buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const content = params.encoding === 'base64'
        ? buffer.toString('base64')
        : buffer.toString('utf-8');

      return {
        success: true,
        bucket: params.bucket,
        key: params.key,
        content,
        contentType: response.ContentType,
        size: response.ContentLength,
        lastModified: response.LastModified?.toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List objects in bucket
   * @param bucket Bucket name
   * @param prefix Filter by key prefix (optional)
   * @param maxKeys Maximum number of objects to return (default: 1000)
   */
  async list(params: { bucket: string; prefix?: string; maxKeys?: number }) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: params.bucket,
        Prefix: params.prefix,
        MaxKeys: params.maxKeys || 1000,
      });

      const response = await this.s3.send(command);

      const objects = (response.Contents || []).map((obj) => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified?.toISOString(),
        etag: obj.ETag,
      }));

      return {
        success: true,
        bucket: params.bucket,
        count: objects.length,
        objects,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete object from bucket
   * @param bucket Bucket name
   * @param key Object key (file path)
   */
  async remove(params: { bucket: string; key: string }) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
      });

      await this.s3.send(command);

      return {
        success: true,
        bucket: params.bucket,
        key: params.key,
        message: 'Object deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete multiple objects from bucket
   * @param bucket Bucket name
   * @param keys Array of object keys to delete
   */
  async removeMany(params: { bucket: string; keys: string[] }) {
    try {
      const command = new DeleteObjectsCommand({
        Bucket: params.bucket,
        Delete: {
          Objects: params.keys.map((key) => ({ Key: key })),
        },
      });

      const response = await this.s3.send(command);

      return {
        success: true,
        bucket: params.bucket,
        deleted: response.Deleted?.length || 0,
        errors: response.Errors?.length || 0,
        message: `${response.Deleted?.length || 0} objects deleted successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get object metadata
   * @param bucket Bucket name
   * @param key Object key (file path)
   */
  async metadata(params: { bucket: string; key: string }) {
    try {
      const command = new HeadObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
      });

      const response = await this.s3.send(command);

      return {
        success: true,
        bucket: params.bucket,
        key: params.key,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified?.toISOString(),
        etag: response.ETag,
        metadata: response.Metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Copy object within S3
   * @param sourceBucket Source bucket name
   * @param sourceKey Source object key
   * @param destinationBucket Destination bucket name
   * @param destinationKey Destination object key
   */
  async copy(params: {
    sourceBucket: string;
    sourceKey: string;
    destinationBucket: string;
    destinationKey: string;
  }) {
    try {
      const command = new CopyObjectCommand({
        CopySource: `${params.sourceBucket}/${params.sourceKey}`,
        Bucket: params.destinationBucket,
        Key: params.destinationKey,
      });

      await this.s3.send(command);

      return {
        success: true,
        source: `${params.sourceBucket}/${params.sourceKey}`,
        destination: `${params.destinationBucket}/${params.destinationKey}`,
        message: 'Object copied successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate presigned URL for object access
   * @param bucket Bucket name
   * @param key Object key (file path)
   * @param expiresIn Expiration time in seconds (default: 3600)
   * @param operation Operation type (default: "get", can be "get" or "put")
   */
  async presign(params: {
    bucket: string;
    key: string;
    expiresIn?: number;
    operation?: string;
  }) {
    try {
      const CommandClass = params.operation === 'put' ? PutObjectCommand : GetObjectCommand;

      const command = new CommandClass({
        Bucket: params.bucket,
        Key: params.key,
      });

      const url = await getSignedUrl(this.s3, command, {
        expiresIn: params.expiresIn || 3600,
      });

      return {
        success: true,
        bucket: params.bucket,
        key: params.key,
        url,
        expiresIn: params.expiresIn || 3600,
        operation: params.operation || 'get',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List all buckets
   */
  async buckets() {
    try {
      const command = new ListBucketsCommand({});
      const response = await this.s3.send(command);

      const buckets = (response.Buckets || []).map((bucket) => ({
        name: bucket.Name,
        creationDate: bucket.CreationDate?.toISOString(),
      }));

      return {
        success: true,
        count: buckets.length,
        buckets,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a new bucket
   * @param bucket Bucket name (must be globally unique)
   */
  async bucket(params: { bucket: string }) {
    try {
      const command = new CreateBucketCommand({
        Bucket: params.bucket,
        // CreateBucketConfiguration only needed for regions other than us-east-1
        ...(this.region !== 'us-east-1' && {
          CreateBucketConfiguration: {
            LocationConstraint: this.region as any,
          },
        }),
      });

      await this.s3.send(command);

      return {
        success: true,
        bucket: params.bucket,
        region: this.region,
        message: 'Bucket created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a bucket (must be empty)
   * @param bucket Bucket name
   */
  async removeBucket(params: { bucket: string }) {
    try {
      const command = new DeleteBucketCommand({
        Bucket: params.bucket,
      });

      await this.s3.send(command);

      return {
        success: true,
        bucket: params.bucket,
        message: 'Bucket deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
