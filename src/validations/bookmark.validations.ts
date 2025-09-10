import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { BOOKMARK_MESSAGES, COMMON } from '~/constants/message'
import AppError from '~/models/Error'
import { validate } from '~/utils/validate'

const getBookmarksValidator = validate(
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
        in: ['query'],
        isString: { errorMessage: COMMON.SORT_BY_INVALID },
        custom: {
          options: (value) => {
            const validFields = ['name', 'rating', 'created_at']
            if (!validFields.includes(value)) {
              throw new AppError(COMMON.SORT_BY_INVALID, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        }
      },
      sortOrder: {
        optional: true,
        in: ['query'],
        isIn: {
          options: [['asc', 'desc', 'ASC', 'DESC']],
          errorMessage: COMMON.SORT_ORDER_INVALID
        }
      }
    },
    ['body']
  )
)

const addBookmarkValidator = validate(
  checkSchema(
    {
      restaurant_id: {
        notEmpty: {
          errorMessage: BOOKMARK_MESSAGES.RESTAURANT_ID_REQUIRED
        }
      },
      user_id: {
        notEmpty: {
          errorMessage: BOOKMARK_MESSAGES.USER_ID_REQUIRED
        }
      }
    },
    ['body']
  )
)

export { getBookmarksValidator, addBookmarkValidator }
