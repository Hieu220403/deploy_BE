import { checkSchema } from 'express-validator'
import { MediaType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON, RESTAURANT_MESSAGES, REVIEW_MESSAGES, USER_MESSAGES } from '~/constants/message'
import AppError from '~/models/Error'
import { convertNumberEnumToArr } from '~/utils/common'
import { validate } from '~/utils/validate'

const getReviewValidator = validate(
  checkSchema(
    {
      page: {
        custom: {
          options: (value) => {
            if (value && isNaN(value)) {
              throw new AppError(COMMON.PAGE_INVALID, HTTP_STATUS.BAD_REQUEST)
            } else if (value && (value < 1 || value > 100)) {
              throw new AppError(COMMON.PAGE_SIZE_INVALID, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        }
      },
      limit: {
        custom: {
          options: (value, { req }) => {
            if (value && isNaN(value)) {
              throw new AppError(COMMON.LIMIT_INVALID, HTTP_STATUS.BAD_REQUEST)
            } else if (value && (value < 1 || value > 100)) {
              throw new AppError(COMMON.LIMIT_MAX, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        }
      },
      sortBy: {
        optional: true,
        isString: { errorMessage: COMMON.SORT_BY_INVALID },
        custom: {
          options: (value) => {
            const validFields = ['rating', 'created_at']
            if (!validFields.includes(value)) {
              throw new AppError(COMMON.SORT_BY_INVALID, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        }
      },
      sortOrder: {
        optional: true,
        isIn: {
          options: [['asc', 'desc', 'ASC', 'DESC']],
          errorMessage: COMMON.SORT_ORDER_INVALID
        }
      },
      rating: {
        optional: true,
        isInt: { errorMessage: RESTAURANT_MESSAGES.RATING_IS_INT },
        custom: {
          options: (value) => {
            const MIN_RATING = 1
            const MAX_RATING = 5
            if (value < MIN_RATING) {
              throw new AppError(REVIEW_MESSAGES.RATING_MIN, HTTP_STATUS.BAD_REQUEST)
            } else if (value > MAX_RATING) {
              throw new AppError(REVIEW_MESSAGES.RATING_MAX, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

const createReviewValidator = validate(
  checkSchema(
    {
      user_id: {
        notEmpty: {
          errorMessage: REVIEW_MESSAGES.USER_ID_REQUIRED
        }
      },
      restaurant_id: {
        in: ['params'],
        notEmpty: {
          errorMessage: REVIEW_MESSAGES.RESTAURANT_ID_REQUIRED
        }
      },
      content: {
        optional: true,
        isString: { errorMessage: REVIEW_MESSAGES.CONTENT_IS_REQUIRED }
      },
      media: {
        optional: true,
        isArray: {
          errorMessage: COMMON.MEDIA_IS_ARRAY
        },
        custom: {
          options: (value) => {
            const MAX_FILE = 4
            const MIN_FILE = 1
            if (value.length > MAX_FILE) {
              throw new AppError(COMMON.MEDIA_ITEM_MAX, HTTP_STATUS.BAD_REQUEST)
            }
            if (value.length < MIN_FILE) {
              throw new AppError(COMMON.MEDIA_ITEM_MIN, HTTP_STATUS.BAD_REQUEST)
            }
            const mediaType = convertNumberEnumToArr(MediaType)
            for (const item of value) {
              if (!mediaType.includes(item.mediaType) || !item.url) {
                throw new AppError(COMMON.MEDIA_ITEM_INVALID, HTTP_STATUS.BAD_REQUEST)
              }
            }
            return true
          }
        }
      },
      rating: {
        isNumeric: { errorMessage: REVIEW_MESSAGES.RATING_IS_NUMBER },
        custom: {
          options: (value) => {
            const MIN_RATING = 1
            const MAX_RATING = 5
            if (value < MIN_RATING) {
              throw new AppError(REVIEW_MESSAGES.RATING_MIN, HTTP_STATUS.BAD_REQUEST)
            } else if (value > MAX_RATING) {
              throw new AppError(REVIEW_MESSAGES.RATING_MAX, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

const updateReviewValidator = validate(
  checkSchema(
    {
      review_id: {
        in: ['params'],
        notEmpty: {
          errorMessage: REVIEW_MESSAGES.REVIEW_ID_REQUIRED
        },
        isString: { errorMessage: REVIEW_MESSAGES.REVIEW_ID_INVALID }
      },
      user_id: {
        notEmpty: {
          errorMessage: REVIEW_MESSAGES.USER_ID_REQUIRED
        },
        isString: { errorMessage: USER_MESSAGES.USER_ID_INVALID },
        custom: {
          options: async (value, { req }) => {
            if (value !== req.user._id.toString()) {
              throw new AppError(USER_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
            }
            return true
          }
        }
      },
      content: {
        optional: true,
        isString: { errorMessage: REVIEW_MESSAGES.CONTENT_IS_REQUIRED }
      },
      media: {
        optional: true,
        isArray: {
          errorMessage: COMMON.MEDIA_IS_ARRAY
        },
        custom: {
          options: (value) => {
            const MAX_FILE = 4
            const MIN_FILE = 1
            if (value.length > MAX_FILE) {
              throw new AppError(COMMON.MEDIA_ITEM_MAX, HTTP_STATUS.BAD_REQUEST)
            }
            if (value.length < MIN_FILE) {
              throw new AppError(COMMON.MEDIA_ITEM_MIN, HTTP_STATUS.BAD_REQUEST)
            }
            const mediaType = convertNumberEnumToArr(MediaType)
            for (const item of value) {
              if (!mediaType.includes(item.mediaType) || !item.url) {
                throw new AppError(COMMON.MEDIA_ITEM_INVALID, HTTP_STATUS.BAD_REQUEST)
              }
            }
            return true
          }
        }
      },
      rating: {
        optional: true,
        isNumeric: { errorMessage: REVIEW_MESSAGES.RATING_IS_NUMBER },
        custom: {
          options: (value) => {
            const MIN_RATING = 1
            const MAX_RATING = 5
            if (value < MIN_RATING) {
              throw new AppError(REVIEW_MESSAGES.RATING_MIN, HTTP_STATUS.BAD_REQUEST)
            } else if (value > MAX_RATING) {
              throw new AppError(REVIEW_MESSAGES.RATING_MAX, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

const deleteReviewValidator = validate(
  checkSchema(
    {
      review_id: {
        in: ['params'],
        notEmpty: {
          errorMessage: REVIEW_MESSAGES.REVIEW_ID_REQUIRED
        }
      },
      user_id: {
        notEmpty: {
          errorMessage: REVIEW_MESSAGES.USER_ID_REQUIRED
        },
        custom: {
          options: (value, { req }) => {
            const { _id } = req.user
            if (value !== _id?.toString()) {
              throw new AppError(REVIEW_MESSAGES.UN_AUTHORIZATION, HTTP_STATUS.FORBIDDEN)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export { createReviewValidator, deleteReviewValidator, getReviewValidator, updateReviewValidator }
