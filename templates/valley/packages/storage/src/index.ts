export type StorageClientConfig = {
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
}

export type StorageClient = {
  bucket: string
  region: string
  /** Stub: upload bytes to object storage from the API layer. */
  upload: (key: string, body: Uint8Array | string) => Promise<{ key: string }>
  /** Stub: return a public or signed URL for an object. */
  getUrl: (key: string) => string
}

export function createStorageClient(config: StorageClientConfig): StorageClient {
  if (!config.bucket) {
    throw new Error('S3_BUCKET is required to create a storage client')
  }
  if (!config.region) {
    throw new Error('S3_REGION is required to create a storage client')
  }
  if (!config.accessKeyId || !config.secretAccessKey) {
    throw new Error('S3 credentials are required to create a storage client')
  }

  return {
    bucket: config.bucket,
    region: config.region,
    async upload(key) {
      // Stub — wire @aws-sdk/client-s3 when you need real uploads.
      return { key }
    },
    getUrl(key) {
      return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`
    },
  }
}
