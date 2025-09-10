import jwt, { JsonWebTokenError, JwtPayload, SignOptions } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { TokenType } from '~/constants/enum'
import { USER_MESSAGES } from '~/constants/message'
import HTTP_STATUS from '~/constants/httpStatus'
import AppError from '~/models/Error'
dotenv.config()

export interface TokenPayload extends JwtPayload {
  userId: string
  tokenType: TokenType
  exp: number
  iat: number
}

export const generateToken = (payload: JwtPayload, expiresIn: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY as string,
      { expiresIn, algorithm: 'HS256' } as SignOptions,
      (err, token) => {
        if (err) {
          throw reject(err)
        } else {
          resolve(token as string)
        }
      }
    )
  })
}

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string)
    return decoded as TokenPayload
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new AppError(USER_MESSAGES.UN_AUTHORIZATION, HTTP_STATUS.UNAUTHORIZED)
    }
    throw error
  }
}
