import express from 'express'
import { validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { ErrorEntity } from '~/models/Error'

export const validate = (validation: RunnableValidationChains<any>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    await validation.run(req)
    const errors = validationResult(req)
    if (errors.isEmpty()) return next()
    const errorObject = errors.mapped()
    const entityError = new ErrorEntity({ errors: {} })
    for (const key in errorObject) {
      const { msg: message } = errorObject[key]
      entityError.message = message
      entityError.errors[key] = message
    }
    next(entityError)
  }
}
