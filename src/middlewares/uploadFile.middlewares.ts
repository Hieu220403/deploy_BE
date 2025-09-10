import { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { v4 } from 'uuid'
import HTTP_STATUS from '~/constants/httpStatus'
import AppError from '~/models/Error'

const multerStorage = multer.memoryStorage()

const multerFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
    cb(null, true)
  } else {
    cb(
      new AppError('Not an image or video! Please upload only images or videos', HTTP_STATUS.BAD_REQUEST) as any,
      false
    )
  }
}

const resizeImageRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next()
  if (req.file.mimetype.startsWith('video')) {
    return next()
  }
  req.file.filename = `${v4()}.jpeg`
  req.file.buffer = await sharp(req.file.buffer)
    .resize({ width: 500, height: 500, fit: 'cover' })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer()
  next()
}

const resizeImageReview = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next()
  if (req.file.mimetype.startsWith('video')) {
    return next()
  }
  req.file.filename = `${v4()}.jpeg`
  req.file.buffer = await sharp(req.file.buffer)
    .resize({ width: 300, height: 300, fit: 'cover' })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer()
  next()
}

const resizeImageMenu = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next()
  if (req.file.mimetype.startsWith('video')) {
    return next()
  }
  req.file.filename = `${v4()}.jpeg`
  req.file.buffer = await sharp(req.file.buffer)
    .resize({ width: 300, height: 300, fit: 'cover' })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer()
  next()
}

const renameVideo = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file || !req.file.mimetype.startsWith('video')) {
    return next()
  }
  const type = req.file.mimetype.split('/')[1]
  req.file.filename = `${v4()}.${type}`

  next()
}

const multerRestaurant = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB
  }
})
const multerMenu = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB
  }
})
const uploadRestaurant = multerRestaurant.single('file')

const multerReview = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB
  }
})
const uploadReview = multerReview.single('file')
const uploadMenu = multerMenu.single('file')
export {
  uploadRestaurant,
  resizeImageRestaurant,
  renameVideo,
  uploadReview,
  resizeImageReview,
  uploadMenu,
  resizeImageMenu
}
