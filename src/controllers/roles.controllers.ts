import { ParamsDictionary, Request } from 'express-serve-static-core'
import { NextFunction, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import rolesServices from '~/services/roles.services'
import { CreateRoleRequest, RoleParams } from '~/requests/role.requests'

class RoleControllers {
  async getAll(req: Request, res: Response, next: NextFunction) {
    const roles = await rolesServices.getAll()
    return res.status(HTTP_STATUS.OK).json({
      data: roles
    })
  }
  async create(req: Request<ParamsDictionary, any, CreateRoleRequest>, res: Response, next: NextFunction) {
    const { role_name, role_id } = req.body
    const result = await rolesServices.create({ role_name, role_id })
    return res.status(HTTP_STATUS.CREATED).json({
      data: result
    })
  }
  async delete(req: Request<RoleParams, any, any>, res: Response, next: NextFunction) {
    const { role_id } = req.params
    const result = await rolesServices.delete(role_id)
    return res.status(HTTP_STATUS.OK).json({
      data: result
    })
  }
}

export default new RoleControllers()
