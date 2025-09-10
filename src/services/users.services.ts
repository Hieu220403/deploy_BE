import User from '~/models/database/User.schema'
import databaseServices from './database.services'
import { hashPassword, comparePassword } from '~/utils/bcrypt'
import { generateToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enum'
import { ParamsGetListUser, SignInRequest, UpdateProfileBody } from '~/requests/user.requests'
import AppError from '~/models/Error'
import { USER_MESSAGES } from '~/constants/message'
import HTTP_STATUS from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'
import { sendForgotPasswordEmail } from '~/utils/s3-ses'

class UserServices {
  private signAccessToken(userId: string): Promise<string> {
    return generateToken(
      {
        userId,
        tokenType: TokenType.AccessToken
      },
      process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h'
    )
  }
  private signRefreshToken(userId: string, exp?: number): Promise<string> {
    if (exp) {
      return generateToken(
        {
          userId,
          tokenType: TokenType.RefreshToken,
          exp
        },
        process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d'
      )
    }
    return generateToken(
      {
        userId,
        tokenType: TokenType.RefreshToken
      },
      process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d'
    )
  }
  private signForgotPasswordToken(userId: string): Promise<string> {
    return generateToken(
      {
        userId,
        tokenType: TokenType.RefreshToken
      },
      process.env.JWT_EMAIL_VERIFY_TOKEN_EXPIRES_IN || '5m'
    )
  }
  async checkEmailExists(email: string): Promise<boolean> {
    const user = await databaseServices.users.findOne({ email })
    return !!user
  }
  async signUp({
    name,
    email,
    password,
    date_of_birth
  }: {
    name: string
    email: string
    password: string
    date_of_birth: string
  }) {
    const result = await databaseServices.users.insertOne(
      new User({
        name,
        email,
        password: hashPassword(password),
        date_of_birth: new Date(date_of_birth)
      })
    )
    return result
  }

  async signIn({ email, password }: SignInRequest) {
    const users = await databaseServices.users
      .aggregate([
        {
          $match: { email }
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'role_id',
            foreignField: 'role_id',
            as: 'role'
          }
        },
        {
          $project: {
            role_id: 0,
            email_verify_token: 0,
            email_verify_expired_at: 0,
            forgot_password_token: 0,
            forgot_password_expired_at: 0
          }
        },
        {
          $unwind: { path: '$role', preserveNullAndEmptyArrays: true }
        }
      ])
      .toArray()
    const user = users[0]
    if (!user || !comparePassword(password, user?.password)) {
      throw new AppError(USER_MESSAGES.LOGIN_INCORRECT, HTTP_STATUS.BAD_REQUEST)
    }
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user._id.toString()),
      this.signRefreshToken(user._id.toString())
    ])
    const { password: _, ...restUser } = user
    return { ...restUser, accessToken, refreshToken }
  }

  async forgotPassword({ user_id, email }: { user_id: string; email: string }) {
    const fiveMinutes = 5 * 60 * 1000
    const token = await this.signForgotPasswordToken(user_id)
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: token,
          forgot_password_expired_at: new Date(Date.now() + fiveMinutes)
        },
        $currentDate: { updated_at: true }
      }
    )
    sendForgotPasswordEmail({
      toAddress: email,
      passwordToken: token
    })
    return token
  }

  async resetPassword(user_id: string, plainTextPassword: string) {
    await databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token: null,
          forgot_password_expired_at: null,
          password: hashPassword(plainTextPassword)
        },
        $currentDate: { updated_at: true }
      }
    )
  }
  async myProfile(user_id: string) {
    const user = await databaseServices.users
      .aggregate([
        {
          $match: { _id: new ObjectId(user_id) }
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'role_id',
            foreignField: 'role_id',
            as: 'role'
          }
        },
        {
          $project: {
            role_id: 0,
            email_verify_token: 0,
            email_verify_expired_at: 0,
            forgot_password_token: 0,
            forgot_password_expired_at: 0
          }
        },
        {
          $unwind: { path: '$role', preserveNullAndEmptyArrays: true }
        }
      ])
      .toArray()
    if (!user) {
      throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }
    const { password: _, ...restUser } = user[0]
    return restUser
  }

  async updateMyProfile(user_id: string, body: UpdateProfileBody) {
    const updateData: UpdateProfileBody = {
      ...body
    }
    if (body?.password) {
      updateData.password = hashPassword(body.password)
    }
    const result = await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: updateData,
        $currentDate: { updated_at: true }
      }
    )
    return result
  }

  async getUserById(user_id: string) {
    const user = await databaseServices.users
      .aggregate([
        {
          $match: { _id: new ObjectId(user_id) }
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'role_id',
            foreignField: 'role_id',
            as: 'role'
          }
        },
        {
          $project: {
            role_id: 0,
            email_verify_token: 0,
            email_verify_expired_at: 0,
            forgot_password_token: 0,
            forgot_password_expired_at: 0
          }
        },
        {
          $unwind: { path: '$role', preserveNullAndEmptyArrays: true }
        }
      ])
      .toArray()
    if (!user) {
      throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }
    const { password: _, ...restUser } = user[0]
    return restUser
  }

  async updateUser(user_id: string, body: UpdateProfileBody) {
    const updateData: UpdateProfileBody = {
      ...body
    }
    if (body?.password) {
      updateData.password = hashPassword(body.password)
    }
    const result = await databaseServices.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: updateData,
        $currentDate: { updated_at: true }
      }
    )
    return result
  }
  async refreshToken(user_id: string) {
    const accessToken = await this.signAccessToken(user_id)
    return accessToken
  }
  async changePassword(user_id: string, plainTextPassword: string) {
    const result = await databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(plainTextPassword)
        },
        $currentDate: { updated_at: true }
      }
    )

    return result.modifiedCount > 0
  }

  async getListUser({ search, page, limit, sortBy, sortOrder, isActive, role }: ParamsGetListUser) {
    const users = await databaseServices.users
      .aggregate([
        {
          $match: {
            ...(search
              ? {
                  $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } }
                  ]
                }
              : {}),
            ...(isActive ? { is_active: isActive } : {}),
            ...(role ? { role_id: role } : {})
          }
        },
        { $sort: { [sortBy || 'created_at']: sortOrder === 'asc' ? 1 : -1 } },
        { $skip: (page! - 1) * limit! },
        {
          $lookup: {
            from: 'roles',
            localField: 'role_id',
            foreignField: 'role_id',
            as: 'role'
          }
        },
        {
          $project: {
            role_id: 0,
            email_verify_token: 0,
            email_verify_expired_at: 0,
            forgot_password_token: 0,
            forgot_password_expired_at: 0,
            password: 0
          }
        },
        {
          $unwind: { path: '$role', preserveNullAndEmptyArrays: true }
        }
      ])
      .toArray()
    const total = await databaseServices.users.countDocuments({
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { username: { $regex: search, $options: 'i' } }
            ]
          }
        : {}),
      ...(isActive ? { is_active: isActive } : {}),
      ...(role ? { role_id: role } : {})
    })
    return {
      result: users,
      total
    }
  }
  async deleteUser(user_id: string) {
    const result = await databaseServices.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          is_active: 0
        },
        $currentDate: { updated_at: true }
      }
    )
    return !!result
  }
}
export default new UserServices()
