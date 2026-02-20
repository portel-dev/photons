/**
 * AWS S3 - Cloud object storage
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon ☁️
 * @tags aws, s3, storage, cloud
 * @dependencies @aws-sdk/client-s3@^3.0.0, @aws-sdk/s3-request-presigner@^3.0.0
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

interface S3Object {
  key: string;
  size?: number;
  lastModified?: string;
  etag?: string;
}

export default class AwsS3 {
  private s3: S3Client;

  constructor(
    accessKeyId: string,
    secretAccessKey: string,
    private region: string = 'us-east-1'
  ) {
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials required');
    }
    this.s3 = new S3Client({
      region: this.region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async onInitialize() {
    try {
      await this.s3.send(new ListBucketsCommand({}));
      console.error(`[aws-s3] ✅ Connected (${this.region})`);
    } catch (e: any) {
      console.error(`[aws-s3] ❌ ${e.message}`);
      throw e;
    }
  }

  /**
   * List all buckets
   * @format list {@title name, @subtitle createdAt:date}
   * @autorun
   * @icon 🪣
   * @timeout 10s
   * @retryable 2 2s
   * @cached 5m
   */
  async buckets() {
    const { Buckets = [] } = await this.s3.send(new ListBucketsCommand({}));
    return Buckets.map(b => ({
      name: b.Name,
      createdAt: b.CreationDate?.toISOString(),
    }));
  }

  /**
   * Create a new bucket
   * @param bucket Bucket name (globally unique) {@example my-app-bucket-2024}
   * @icon ➕
   * @timeout 15s
   * @retryable 2 3s
   */
  async bucket(params: { bucket: string }) {
    const cmd = new CreateBucketCommand({
      Bucket: params.bucket,
      ...(this.region !== 'us-east-1' && {
        CreateBucketConfiguration: { LocationConstraint: this.region as any },
      }),
    });
    await this.s3.send(cmd);
    return { bucket: params.bucket, region: this.region };
  }

  /**
   * Delete a bucket (must be empty)
   * @param bucket Bucket name {@example my-old-bucket}
   * @icon 🗑️
   */
  async drop(params: { bucket: string }) {
    await this.s3.send(new DeleteBucketCommand({ Bucket: params.bucket }));
    return { bucket: params.bucket, deleted: true };
  }

  /**
   * List objects in bucket
   * @param bucket Bucket name {@example my-app-bucket}
   * @param prefix Filter by prefix (optional) {@example documents/}
   * @param maxKeys Maximum objects to return {@default 1000}
   * @format list {@title key, @subtitle size, lastModified:date}
   * @autorun
   * @icon 📋
   * @timeout 15s
   * @retryable 2 2s
   */
  async list(params: { bucket: string; prefix?: string; maxKeys?: number }): Promise<S3Object[]> {
    const { Contents = [] } = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: params.bucket,
        Prefix: params.prefix,
        MaxKeys: params.maxKeys ?? 1000,
      })
    );
    return Contents.map(obj => ({
      key: obj.Key!,
      size: obj.Size,
      lastModified: obj.LastModified?.toISOString(),
      etag: obj.ETag,
    }));
  }

  /**
   * Upload object to S3
   * @param bucket Bucket name {@example my-app-bucket}
   * @param key Object key/path {@example documents/report.pdf}
   * @param content File content (string or base64)
   * @param contentType MIME type (optional) {@example text/plain}
   * @param encoding Content encoding (optional) {@choice base64}
   * @icon ⬆️
   * @timeout 2m
   * @retryable 2 3s
   */
  async upload(params: {
    bucket: string;
    key: string;
    content: string;
    contentType?: string;
    encoding?: string;
  }) {
    const body = params.encoding === 'base64'
      ? Buffer.from(params.content, 'base64')
      : params.content;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
        Body: body,
        ContentType: params.contentType,
      })
    );

    return {
      bucket: params.bucket,
      key: params.key,
      url: `https://${params.bucket}.s3.${this.region}.amazonaws.com/${params.key}`,
    };
  }

  /**
   * Download object from S3
   * @param bucket Bucket name {@example my-app-bucket}
   * @param key Object key/path {@example documents/report.pdf}
   * @param encoding Return encoding (optional) {@choice base64}
   * @icon ⬇️
   * @timeout 2m
   * @retryable 2 3s
   */
  async download(params: { bucket: string; key: string; encoding?: string }) {
    const response = await this.s3.send(
      new GetObjectCommand({ Bucket: params.bucket, Key: params.key })
    );

    if (!response.Body) {
      throw new Error('Object body is empty');
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return {
      bucket: params.bucket,
      key: params.key,
      content: params.encoding === 'base64'
        ? buffer.toString('base64')
        : buffer.toString('utf-8'),
      contentType: response.ContentType,
      size: response.ContentLength,
      lastModified: response.LastModified?.toISOString(),
    };
  }

  /**
   * Get object metadata
   * @param bucket Bucket name {@example my-app-bucket}
   * @param key Object key/path {@example documents/report.pdf}
   * @format card
   * @icon ℹ️
   * @timeout 10s
   * @retryable 2 2s
   */
  async metadata(params: { bucket: string; key: string }) {
    const response = await this.s3.send(
      new HeadObjectCommand({ Bucket: params.bucket, Key: params.key })
    );

    return {
      bucket: params.bucket,
      key: params.key,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified?.toISOString(),
      etag: response.ETag,
      metadata: response.Metadata,
    };
  }

  /**
   * Copy object within S3
   * @param sourceBucket Source bucket {@example my-source-bucket}
   * @param sourceKey Source object key {@example documents/original.pdf}
   * @param destinationBucket Destination bucket {@example my-dest-bucket}
   * @param destinationKey Destination object key {@example backups/copy.pdf}
   * @icon 📋
   * @timeout 2m
   * @retryable 2 3s
   */
  async copy(params: {
    sourceBucket: string;
    sourceKey: string;
    destinationBucket: string;
    destinationKey: string;
  }) {
    await this.s3.send(
      new CopyObjectCommand({
        CopySource: `${params.sourceBucket}/${params.sourceKey}`,
        Bucket: params.destinationBucket,
        Key: params.destinationKey,
      })
    );

    return {
      source: `${params.sourceBucket}/${params.sourceKey}`,
      destination: `${params.destinationBucket}/${params.destinationKey}`,
    };
  }

  /**
   * Delete object from bucket
   * @param bucket Bucket name {@example my-app-bucket}
   * @param key Object key/path {@example documents/old-report.pdf}
   * @icon 🗑️
   * @timeout 10s
   * @retryable 2 2s
   */
  async delete(params: { bucket: string; key: string }) {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: params.bucket, Key: params.key })
    );
    return { bucket: params.bucket, key: params.key, deleted: true };
  }

  /**
   * Delete multiple objects from bucket
   * @param bucket Bucket name {@example my-app-bucket}
   * @param keys Array of object keys to delete {@example ["old/file1.txt","old/file2.txt"]}
   * @icon 🗑️
   * @timeout 30s
   * @retryable 2 3s
   */
  async purge(params: { bucket: string; keys: string[] }) {
    const response = await this.s3.send(
      new DeleteObjectsCommand({
        Bucket: params.bucket,
        Delete: { Objects: params.keys.map(key => ({ Key: key })) },
      })
    );

    return {
      bucket: params.bucket,
      deleted: response.Deleted?.length ?? 0,
      errors: response.Errors?.length ?? 0,
    };
  }

  /**
   * Generate presigned URL for object
   * @param bucket Bucket name {@example my-app-bucket}
   * @param key Object key/path {@example documents/report.pdf}
   * @param expiresIn Expiration time in seconds {@default 3600}
   * @param operation Operation type {@choice get,put}
   * @icon 🔗
   * @timeout 5s
   */
  async presign(params: {
    bucket: string;
    key: string;
    expiresIn?: number;
    operation?: string;
  }) {
    const CommandClass = params.operation === 'put' ? PutObjectCommand : GetObjectCommand;
    const cmd = new CommandClass({ Bucket: params.bucket, Key: params.key });

    const url = await getSignedUrl(this.s3, cmd, {
      expiresIn: params.expiresIn ?? 3600,
    });

    return {
      bucket: params.bucket,
      key: params.key,
      url,
      expiresIn: params.expiresIn ?? 3600,
      operation: params.operation ?? 'get',
    };
  }
}
