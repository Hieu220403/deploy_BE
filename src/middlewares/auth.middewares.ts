import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { RoleType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
import AppError from '~/models/Error'
import databaseServices from '~/services/database.services'
import { verifyToken } from '~/utils/jwt'

export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const headers = req?.headers
    const accessToken = headers.authorization?.slice('Bearer '.length)
    if (!headers || !accessToken) {
      next(new AppError(USER_MESSAGES.UN_AUTHORIZATION, HTTP_STATUS.UNAUTHORIZED))
      return
    }
    const decodedToken = await verifyToken(accessToken)
    if (decodedToken) {
      const freshUser = await databaseServices.users.findOne({ _id: new ObjectId(decodedToken.userId) })
      if (!freshUser) {
        next(new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED))
        return
      }
      req.user = freshUser
    }
    next()
  } catch (error) {
    next(error)
  }
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user
  if (!user || user.role_id !== RoleType.Admin) {
    next(new AppError(USER_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN))
    return
  }
  next()
}
