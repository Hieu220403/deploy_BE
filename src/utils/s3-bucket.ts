import { DeleteObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { config } from 'dotenv'
import HTTP_STATUS from '~/constants/httpStatus'
import { Media } from '~/type'
config()
const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
  }
})

const uploadFileToS3 = async (params: PutObjectCommandInput): Promise<Media> => {
  const isVideo = params.ContentType?.startsWith('video')
  const upload = new Upload({
    client: s3Client,
    params,
    ...(isVideo && {
      partSize: 5 * 1024 * 1024,
      queueSize: 4
    })
  })
  await upload.done()
  const fileUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`
  return {
    mediaType: isVideo ? 1 : 0,
    url: fileUrl
  }
}
const deleteImageFromS3 = async (key: string): Promise<any> => {
  const url = new URL(key)
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET as string,
    Key: url.pathname.slice(1)
  })
  const result = await s3Client.send(command)
  return result.$metadata.httpStatusCode === HTTP_STATUS.NO_CONTENT
}
export { uploadFileToS3, deleteImageFromS3 }
