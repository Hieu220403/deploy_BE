import { checkSchema } from 'express-validator'
import { DayOfWeek, MediaType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON, RESTAURANT_MESSAGES } from '~/constants/message'
import { REGEX_PHONE_VN } from '~/constants/regex'
import { SpecialOpeningDay, WeeklyOpeningHours } from '~/models/database/Restaurant.schema'
import AppError from '~/models/Error'
import { convertNumberEnumToArr } from '~/utils/common'
import { validate } from '~/utils/validate'

const getListValidator = validate(
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
      },
      search: {
        optional: true,
        in: ['query'],
        isString: { errorMessage: RESTAURANT_MESSAGES.NAME_IS_REQUIRED },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: RESTAURANT_MESSAGES.NAME_LENGTH
        }
      },
      rating: {
        optional: true,
        in: ['query'],
        isInt: { errorMessage: RESTAURANT_MESSAGES.RATING_IS_INT },
        custom: {
          options: (value) => {
            if (value < 1 || value > 5) {
              throw new AppError(RESTAURANT_MESSAGES.RATING_IS_INT, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

const getOrDeleteRestaurantDetailValidator = validate(
  checkSchema(
    {
      restaurant_id: {
        in: ['params'],
        notEmpty: {
          errorMessage: RESTAURANT_MESSAGES.ID_IS_REQUIRED
        },
        isString: {
          errorMessage: RESTAURANT_MESSAGES.ID_IS_STRING
        }
      }
    },
    ['params']
  )
)

const createRestaurantValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: RESTAURANT_MESSAGES.NAME_IS_REQUIRED
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: RESTAURANT_MESSAGES.NAME_LENGTH
        },
        trim: true
      },
      avatar: {
        optional: true,
        isString: {
          errorMessage: RESTAURANT_MESSAGES.AVATAR_IS_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!value || value.trim() === '') {
              throw new AppError(RESTAURANT_MESSAGES.AVATAR_IS_REQUIRED, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        },
        trim: true
      },
      address: {
        notEmpty: {
          errorMessage: RESTAURANT_MESSAGES.ADDRESS_IS_REQUIRED
        },
        trim: true
      },
      description: {
        notEmpty: {
          errorMessage: RESTAURANT_MESSAGES.DESCRIPTION_IS_REQUIRED
        },
        isLength: {
          options: { min: 1, max: 500 },
          errorMessage: RESTAURANT_MESSAGES.DESCRIPTION_LENGTH
        },
        trim: true
      },
      phone_number: {
        notEmpty: {
          errorMessage: RESTAURANT_MESSAGES.PHONE_NUMBER_IS_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!REGEX_PHONE_VN.test(value)) {
              throw new AppError(RESTAURANT_MESSAGES.PHONE_NUMBER_IS_INVALID, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        },
        trim: true
      },
      website: {
        optional: true,
        isString: {
          errorMessage: RESTAURANT_MESSAGES.WEBSITE_IS_STRING
        },
        trim: true
      },
      weekly_opening_hours: {
        isArray: {
          errorMessage: RESTAURANT_MESSAGES.WEEKLY_OPENING_HOURS_IS_ARRAY
        },
        custom: {
          options: (value) => {
            for (const element of value as WeeklyOpeningHours[]) {
              if (!element.day_of_week || !element.open || !element.close) {
                throw new AppError(RESTAURANT_MESSAGES.WEEKLY_OPENING_HOURS_INVALID, HTTP_STATUS.BAD_REQUEST)
              }
              if (!(element.day_of_week in DayOfWeek)) {
                console.log(element.day_of_week, DayOfWeek)
                throw new AppError(RESTAURANT_MESSAGES.SPECIAL_OPENING_DAYS_INVALID, HTTP_STATUS.BAD_REQUEST)
              }
            }
            return true
          }
        }
      },
      special_opening_days: {
        optional: true,
        isArray: {
          errorMessage: RESTAURANT_MESSAGES.SPECIAL_OPENING_DAYS_IS_ARRAY
        },
        custom: {
          options: (value) => {
            for (const element of value as SpecialOpeningDay[]) {
              if (!element.note || !element.date || !element.open || !element.close) {
                throw new AppError(RESTAURANT_MESSAGES.WEEKLY_OPENING_HOURS_INVALID, HTTP_STATUS.BAD_REQUEST)
              }
            }
            return true
          }
        }
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
      }
    },
    ['body']
  )
)

const updateRestaurantValidator = validate(
  checkSchema(
    {
      restaurant_id: {
        isString: { errorMessage: RESTAURANT_MESSAGES.RESTAURANT_ID_IS_INVALID },
        notEmpty: {
          errorMessage: RESTAURANT_MESSAGES.RESTAURANT_ID_IS_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!value || value.trim() === '') {
              throw new AppError(RESTAURANT_MESSAGES.RESTAURANT_ID_IS_REQUIRED, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        },
        in: ['params']
      },
      name: {
        optional: true,
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: RESTAURANT_MESSAGES.NAME_LENGTH
        },
        trim: true
      },
      avatar: {
        optional: true,
        isString: {
          errorMessage: RESTAURANT_MESSAGES.AVATAR_IS_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!value || value.trim() === '') {
              throw new AppError(RESTAURANT_MESSAGES.AVATAR_IS_REQUIRED, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        },
        trim: true
      },
      address: {
        optional: true,
        trim: true
      },
      description: {
        optional: true,
        isLength: {
          options: { min: 1, max: 500 },
          errorMessage: RESTAURANT_MESSAGES.DESCRIPTION_LENGTH
        },
        trim: true
      },
      phone_number: {
        optional: true,
        custom: {
          options: (value) => {
            if (!REGEX_PHONE_VN.test(value)) {
              throw new AppError(RESTAURANT_MESSAGES.PHONE_NUMBER_IS_INVALID, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        },
        trim: true
      },
      website: {
        optional: true,
        isString: {
          errorMessage: RESTAURANT_MESSAGES.WEBSITE_IS_STRING
        },
        trim: true
      },
      weekly_opening_hours: {
        optional: true,
        isArray: {
          errorMessage: RESTAURANT_MESSAGES.WEEKLY_OPENING_HOURS_IS_ARRAY
        },
        custom: {
          options: (value) => {
            for (const element of value as WeeklyOpeningHours[]) {
              if (!element.day_of_week || !element.open || !element.close) {
                throw new AppError(RESTAURANT_MESSAGES.WEEKLY_OPENING_HOURS_INVALID, HTTP_STATUS.BAD_REQUEST)
              }
              if (!(element.day_of_week in DayOfWeek)) {
                console.log(element.day_of_week, DayOfWeek)
                throw new AppError(RESTAURANT_MESSAGES.SPECIAL_OPENING_DAYS_INVALID, HTTP_STATUS.BAD_REQUEST)
              }
            }
            return true
          }
        }
      },
      special_opening_days: {
        optional: true,
        isArray: {
          errorMessage: RESTAURANT_MESSAGES.SPECIAL_OPENING_DAYS_IS_ARRAY
        },
        custom: {
          options: (value) => {
            for (const element of value as SpecialOpeningDay[]) {
              if (!element.note || !element.date || !element.open || !element.close) {
                throw new AppError(RESTAURANT_MESSAGES.WEEKLY_OPENING_HOURS_INVALID, HTTP_STATUS.BAD_REQUEST)
              }
            }
            return true
          }
        }
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
      }
    },
    ['body']
  )
)
export { createRestaurantValidator, getListValidator, getOrDeleteRestaurantDetailValidator, updateRestaurantValidator }
