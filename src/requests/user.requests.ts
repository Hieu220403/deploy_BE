import { RoleType } from '~/constants/enum'

export interface SignInRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  email: string
  password: string
  date_of_birth: string
  name: string
}

export interface UpdateProfileBody {
  name?: string
  date_of_birth?: Date
  bio?: string
  username?: string
  avatar?: string
  cover?: string
  password?: string
}
export interface ParamsGetListUser {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: string
  isActive?: 1 | 0
  role?: RoleType
}
