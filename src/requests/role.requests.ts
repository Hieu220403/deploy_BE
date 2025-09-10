import { RoleType } from '~/constants/enum'

export interface CreateRoleRequest {
  role_name: string
  role_id: RoleType
}

export interface RoleParams {
  role_id: string
}
