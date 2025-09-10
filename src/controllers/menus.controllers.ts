import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { CreateMenuRequest, GetMenuParamsRequest, UpdateOrDeleteMenuRequest } from '~/requests/menu.requests'
import menuServices from '~/services/menu.services'
import { uploadFileToS3 } from '~/utils/s3-bucket'

class MenuControllers {
  async getMenu(req: Request<GetMenuParamsRequest, any, any>, res: Response, next: NextFunction) {
    const { restaurant_id } = req.params
    const result = await menuServices.getMenu(restaurant_id)
    return res.status(HTTP_STATUS.OK).json({
      data: result
    })
  }

  async createMenu(req: Request<GetMenuParamsRequest, any, CreateMenuRequest>, res: Response, next: NextFunction) {
    const { restaurant_id } = req.params
    const { name, description, price, media } = req.body
    const result = await menuServices.createMenu({ restaurant_id, name, description, price, media })
    return res.status(HTTP_STATUS.CREATED).json({
      data: result
    })
  }
  async updateMenu(req: Request<UpdateOrDeleteMenuRequest, any, CreateMenuRequest>, res: Response, next: NextFunction) {
    const { restaurant_id, menu_id } = req.params
    const { name, description, price, media } = req.body
    const result = await menuServices.updateMenu({ restaurant_id, menu_id, name, description, price, media })
    return res.status(HTTP_STATUS.OK).json({
      data: result
    })
  }

  async deleteMenu(req: Request<UpdateOrDeleteMenuRequest, any, CreateMenuRequest>, res: Response, next: NextFunction) {
    const { restaurant_id, menu_id } = req.params
    const result = await menuServices.deleteMenu({ restaurant_id, menu_id })
    return res.status(HTTP_STATUS.OK).json({
      data: result
    })
  }

  async uploadMenuImage(req: Request<GetMenuParamsRequest, any, any>, res: Response, next: NextFunction) {
    const params = {
      Bucket: process.env.AWS_BUCKET as string,
      ContentType: req.file?.mimetype,
      Key: `menus/restaurants-${req.file?.filename}`,
      Body: req.file?.buffer
    }
    const result = await uploadFileToS3(params)
    return res.status(HTTP_STATUS.OK).json({
      data: result
    })
  }
}
export default new MenuControllers()
