import HTTP_STATUS from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
class AppError extends Error {
  statusCode: string
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status || 500
    this.statusCode = `${this.status}`.startsWith('4') ? 'fail' : 'error'
    Error.captureStackTrace(this, this.constructor)
  }
}
export default AppError

type ErrorType = Record<
  string,
  {
    message: string
    [key: string]: any
  }
>

export class ErrorWithStatus {
  message: string
  status: number
  constructor(message: string, status: number) {
    this.message = message
    this.status = status
  }
}
export class ErrorEntity extends ErrorWithStatus {
  errors: ErrorType
  constructor({ message = USER_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorType }) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY)
    this.errors = errors
  }
}

