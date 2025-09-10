import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import HTTP_STATUS from '~/constants/httpStatus'
import AppError from '~/models/Error'
config()

const sesClient = new SESClient({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
  }
})

const forgotPasswordTemplate = fs.readFileSync(path.join(__dirname, '../template/forgot-password.html'), 'utf-8')

const createSendEmailCommand = ({
  toAddress,
  subject,
  template,
  textBody
}: {
  toAddress: string
  subject: string
  template: string
  textBody: string
}) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [process.env.AWS_SES_CC_EMAIL as string],
      ToAddresses: [toAddress]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: template
        },
        Text: {
          Charset: 'UTF-8',
          Data: textBody
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    ReplyToAddresses: [] as any[],
    Source: process.env.AWS_SES_CC_EMAIL as string
  })
}

const sendForgotPasswordEmail = async ({ toAddress, passwordToken }: { toAddress: string; passwordToken: string }) => {
  try {
    const contentTemplateForgotPassword = forgotPasswordTemplate
      .replace('{{YEAR}}', new Date().getFullYear().toString())
      .replace('{{RESET_LINK}}', `${process.env.CLIENT_URL}/reset-password?token=${passwordToken}`)
    const command = createSendEmailCommand({
      toAddress,
      subject: 'Forgot Password',
      template: contentTemplateForgotPassword,
      textBody: 'Please click the link to reset your password.'
    })
    const data = await sesClient.send(command)
    return data.$metadata.httpStatusCode === HTTP_STATUS.OK
  } catch (error) {
    throw new AppError('Failed to send email', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
export { sendForgotPasswordEmail }
