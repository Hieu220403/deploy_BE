import { Express, NextFunction, Request, Response } from 'express'
import userRouter from './users.routes'
import restaurantRouter from './restaurants.routes'
import bookmarkRouter from './bookmarks.routes'
import roleRouter from './roles.routes'
import menuRouter from './menu.routes'
import reviewRouter from './reviews.routes'

import AppError from '~/models/Error'
import HTTP_STATUS from '~/constants/httpStatus'

const route = (app: Express) => {
  app.use('/v1/users', userRouter)
  app.use('/v1/restaurants', restaurantRouter)
  app.use('/v1/bookmarks', bookmarkRouter)
  app.use('/v1/menu', menuRouter)
  app.use('/v1/roles', roleRouter)
  app.use('/v1/reviews', reviewRouter)

  app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
    const original = req.originalUrl
    const path = req.path
    next(new AppError(`Cannot find ${original} ${path} on this server`, HTTP_STATUS.NOT_FOUND))
  })
}

export default route
