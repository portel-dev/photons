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
   * @param bucket {@min 1} {@max 63} Bucket name {@example my-app-bucket}
   * @param key {@min 1} {@max 1024} Object key (file path) {@example documents/report.pdf}
   * @param content {@min 1} Content to upload (string or base64) {@example Hello World}
   * @param contentType {@max 100} MIME type (optional) {@example text/plain}
   * @param encoding {@max 20} Content encoding (optional) {@example base64}
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
   * @param bucket {@min 1} {@max 63} Bucket name {@example my-app-bucket}
   * @param key {@min 1} {@max 1024} Object key (file path) {@example documents/report.pdf}
   * @param encoding {@max 20} Return encoding (optional, "base64" for binary files) {@example base64}
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
   * @param bucket {@min 1} {@max 63} Bucket name {@example my-app-bucket}
   * @param prefix {@max 1024} Filter by key prefix (optional) {@example documents/}
   * @param maxKeys {@min 1} {@max 1000} Maximum number of objects to return (default: 1000)
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
   * @param bucket {@min 1} {@max 63} Bucket name {@example my-app-bucket}
   * @param key {@min 1} {@max 1024} Object key (file path) {@example documents/old-report.pdf}
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
   * @param bucket {@min 1} {@max 63} Bucket name {@example my-app-bucket}
   * @param keys {@min 1} Array of object keys to delete {@example ["old/file1.txt","old/file2.txt"]}
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
   * @param bucket {@min 1} {@max 63} Bucket name {@example my-app-bucket}
   * @param key {@min 1} {@max 1024} Object key (file path) {@example documents/report.pdf}
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
   * @param sourceBucket {@min 1} {@max 63} Source bucket name {@example my-source-bucket}
   * @param sourceKey {@min 1} {@max 1024} Source object key {@example documents/original.pdf}
   * @param destinationBucket {@min 1} {@max 63} Destination bucket name {@example my-dest-bucket}
   * @param destinationKey {@min 1} {@max 1024} Destination object key {@example backups/copy.pdf}
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
   * @param bucket {@min 1} {@max 63} Bucket name {@example my-app-bucket}
   * @param key {@min 1} {@max 1024} Object key (file path) {@example documents/report.pdf}
   * @param expiresIn {@min 1} {@max 604800} Expiration time in seconds (default: 3600)
   * @param operation {@max 10} Operation type (default: "get") {@example get}
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
   * @param bucket {@min 1} {@max 63} Bucket name (must be globally unique) {@example my-new-app-bucket-2024}
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
   * @param bucket {@min 1} {@max 63} Bucket name {@example my-old-bucket}
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
