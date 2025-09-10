import { ObjectId } from 'mongodb'
import { RoleType, UserVerifyStatus } from '~/constants/enum'

export interface UserI {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string | null
  email_verify_expired_at?: Date | null
  forgot_password_token?: string | null
  forgot_password_expired_at?: Date | null
  verify?: UserVerifyStatus
  bio?: string | null
  username?: string
  avatar?: string | null
  cover?: string | null
  role_id?: number
  is_active?: number
  is_deleted?: boolean
}
export default class User {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  email_verify_token: string | null
  email_verify_expired_at: Date | null
  forgot_password_token: string | null
  forgot_password_expired_at: Date | null
  verify: UserVerifyStatus
  bio: string | null
  username: string
  avatar: string | null
  cover: string | null
  created_at: Date
  updated_at: Date
  role_id?: number
  is_active?: number
  is_deleted?: boolean
  constructor(user: UserI) {
    const date = new Date()
    this._id = user._id
    this.name = user.name || ''
    this.email = user.email || ''
    this.date_of_birth = user.date_of_birth || date
    this.password = user.password
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.email_verify_token = user.email_verify_token || null
    this.email_verify_expired_at = null
    this.forgot_password_token = user.forgot_password_token || null
    this.forgot_password_expired_at = null
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.bio = user.bio || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.cover = user.cover || ''
    this.role_id = user.role_id || RoleType.Admin
    this.is_active = user.is_active || 1
    this.is_deleted = user.is_deleted || false
  }
}
