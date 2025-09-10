import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RoleType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
import { UserI } from '~/models/database/User.schema'
import { ParamsGetListUser, SignInRequest, SignUpRequest, UpdateProfileBody } from '~/requests/user.requests'
import usersServices from '~/services/users.services'

class UserControllers {
  async signUp(req: Request<ParamsDictionary, any, SignUpRequest>, res: Response, next: NextFunction) {
    const { name, email, password, date_of_birth } = req.body
    const result = await usersServices.signUp({
      name,
      email,
      password,
      date_of_birth
    })

    return res.status(HTTP_STATUS.CREATED).json({
      message: USER_MESSAGES.REGISTER_SUCCESS,
      data: result
    })
  }
  async signIn(req: Request<ParamsDictionary, any, SignInRequest>, res: Response, next: NextFunction) {
    const { email, password } = req.body
    const result = await usersServices.signIn({
      email,
      password
    })

    return res.status(HTTP_STATUS.OK).json({
      data: result
    })
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    const { _id, email } = req.user as UserI
    const result = await usersServices.forgotPassword({ user_id: _id!.toString(), email })
    return res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD,
      data: result
    })
  }
  async verifyForgotPasswordToken(req: Request, res: Response, next: NextFunction) {
    return res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS,
      data: true
    })
  }
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    const { _id } = req.user as UserI
    const { password } = req.body
    await usersServices.resetPassword(_id!.toString(), password)
    return res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.RESET_PASSWORD_SUCCESS,
      data: true
    })
  }

  async myProfile(req: Request, res: Response, next: NextFunction) {
    const { _id } = req.user as UserI
    const result = await usersServices.myProfile(_id!.toString())
    return res.status(HTTP_STATUS.OK).json({
      data: {
        ...result
      }
    })
  }

  async updateMyProfile(req: Request<ParamsDictionary, any, UpdateProfileBody>, res: Response, next: NextFunction) {
    const { _id } = req.user as UserI
    const result = await usersServices.updateMyProfile(_id!.toString(), req.body)
    return res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.UPDATE_PROFILE_SUCCESS,
      data: {
        ...result
      }
    })
  }

  async getUserById(req: Request<{ user_id: string }, any, any>, res: Response, next: NextFunction) {
    const { user_id } = req.params
    const result = await usersServices.getUserById(user_id)
    return res.status(HTTP_STATUS.OK).json({
      data: {
        ...result
      }
    })
  }
  async updateUser(req: Request<{ user_id: string }, any, UpdateProfileBody>, res: Response, next: NextFunction) {
    const { user_id } = req.params
    const result = await usersServices.updateUser(user_id, req.body)
    return res.status(HTTP_STATUS.OK).json({
      data: {
        ...result
      }
    })
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const { _id } = req.user as UserI
    const result = await usersServices.refreshToken(_id!.toString())
    return res.status(HTTP_STATUS.OK).json({
      data: {
        accessToken: result
      }
    })
  }
  async changePassword(req: Request, res: Response, next: NextFunction) {
    const { _id } = req.user as UserI
    const { password } = req.body
    await usersServices.changePassword(_id!.toString(), password)
    return res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS,
      data: true
    })
  }
  async getListUser(req: Request<ParamsGetListUser, any, any>, res: Response, next: NextFunction) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      isActive = undefined,
      role = undefined
    } = req.query
    const { result, total } = await usersServices.getListUser({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as string,
      isActive: isActive === undefined ? undefined : Number(isActive) === 1 ? 1 : 0,
      role: role as RoleType | undefined
    })
    return res.status(HTTP_STATUS.OK).json({
      data: result,
      pagination: {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        total
      }
    })
  }
  async deleteUser(req: Request<{ user_id: string }, any, any>, res: Response, next: NextFunction) {
    const { user_id } = req.params
    const result = await usersServices.deleteUser(user_id)
    return res.status(HTTP_STATUS.OK).json({
      data: result
    })
  }
}
export default new UserControllers()
