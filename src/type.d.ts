import { MediaType } from './constants/enum'

export interface Media {
  url: string
  mediaType: MediaType
}

import { Request } from 'express'
import { UserI } from './models/database/User.schema'
declare module 'express' {
  interface Request {
    user?: UserI
  }
}
