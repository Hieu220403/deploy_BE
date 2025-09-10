import { ObjectId } from 'mongodb'
import { RoleType } from '~/constants/enum'

export interface IRole {
  _id?: ObjectId
  role_id: RoleType
  role_name: string
}

class Role {
  _id?: ObjectId
  role_id: RoleType
  role_name: string
  constructor(role: IRole) {
    this._id = role._id
    this.role_id = role.role_id || RoleType.User
    this.role_name = role.role_name
  }
}

export default Role
