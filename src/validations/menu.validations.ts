import { checkSchema } from 'express-validator'
import { MediaType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON, MENU_MESSAGES } from '~/constants/message'
import AppError from '~/models/Error'
import { convertNumberEnumToArr } from '~/utils/common'
import { validate } from '~/utils/validate'

const getMenuValidator = validate(
  checkSchema(
    {
      restaurant_id: {
        notEmpty: {
          errorMessage: MENU_MESSAGES.RESTAURANT_IS_REQUIRED
        },
        isString: {
          errorMessage: MENU_MESSAGES.RESTAURANT_ID_IS_INVALID
        }
      }
    },
    ['params']
  )
)

const createMenuValidator = validate(
  checkSchema({
    restaurant_id: {
      in: ['params'],
      notEmpty: {
        errorMessage: MENU_MESSAGES.RESTAURANT_IS_REQUIRED
      },
      isString: {
        errorMessage: MENU_MESSAGES.RESTAURANT_ID_IS_INVALID
      }
    },
    name: {
      in: ['body'],
      notEmpty: {
        errorMessage: MENU_MESSAGES.NAME_IS_REQUIRED
      },
      isString: {
        errorMessage: MENU_MESSAGES.NAME_IS_INVALID
      }
    },
    price: {
      in: ['body'],
      notEmpty: {
        errorMessage: MENU_MESSAGES.PRICE_IS_REQUIRED
      },
      isNumeric: {
        errorMessage: MENU_MESSAGES.PRICE_IS_NUMBER
      }
    },
    description: {
      in: ['body'],
      notEmpty: {
        errorMessage: MENU_MESSAGES.DESCRIPTION_IS_REQUIRED
      },
      isString: {
        errorMessage: MENU_MESSAGES.DESCRIPTION_IS_INVALID
      }
    },
    media: {
      in: ['body'],
      notEmpty: {
        errorMessage: COMMON.MEDIA_ITEM_REQUIRED
      },
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
              throw new AppError(COMMON.MEDIA_ITEM_TYPE_INVALID, HTTP_STATUS.BAD_REQUEST)
            }
          }
          return true
        }
      }
    }
  })
)

const deleteMenuValidator = validate(
  checkSchema({
    restaurant_id: {
      in: ['params'],
      notEmpty: {
        errorMessage: MENU_MESSAGES.RESTAURANT_IS_REQUIRED
      },
      isString: {
        errorMessage: MENU_MESSAGES.RESTAURANT_ID_IS_INVALID
      }
    },
    menu_id: {
      in: ['params'],
      notEmpty: {
        errorMessage: MENU_MESSAGES.MENU_ID_IS_REQUIRED
      },
      isString: {
        errorMessage: MENU_MESSAGES.MENU_ID_IS_INVALID
      }
    }
  })
)

const updateMenuValidator = validate(
  checkSchema({
    menu_id: {
      in: ['params'],
      notEmpty: {
        errorMessage: MENU_MESSAGES.MENU_ID_IS_REQUIRED
      },
      isString: {
        errorMessage: MENU_MESSAGES.MENU_ID_IS_INVALID
      }
    },
    restaurant_id: {
      in: ['params'],
      notEmpty: {
        errorMessage: MENU_MESSAGES.RESTAURANT_IS_REQUIRED
      },
      isString: {
        errorMessage: MENU_MESSAGES.RESTAURANT_ID_IS_INVALID
      }
    },
    name: {
      in: ['body'],
      optional: true,
      isString: {
        errorMessage: MENU_MESSAGES.NAME_IS_INVALID
      }
    },
    price: {
      in: ['body'],
      optional: true,

      isNumeric: {
        errorMessage: MENU_MESSAGES.PRICE_IS_NUMBER
      }
    },
    description: {
      in: ['body'],
      optional: true,
      isString: {
        errorMessage: MENU_MESSAGES.DESCRIPTION_IS_INVALID
      }
    },
    media: {
      in: ['body'],
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
  })
)

export { getMenuValidator, createMenuValidator, deleteMenuValidator, updateMenuValidator }
