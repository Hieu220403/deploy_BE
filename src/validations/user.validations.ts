import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { RoleType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON, USER_MESSAGES } from '~/constants/message'
import AppError from '~/models/Error'
import databaseServices from '~/services/database.services'
import usersServices from '~/services/users.services'
import { convertNumberEnumToArr } from '~/utils/common'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validate'

const signUpValidator = validate(
  checkSchema(
    {
      name: {
        isString: true,
        notEmpty: {
          errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: USER_MESSAGES.NAME_LENGTH
        },
        trim: true
      },
      email: {
        notEmpty: {
          errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const isExist = await usersServices.checkEmailExists(value)
            if (isExist) {
              throw new AppError(USER_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.UNPROCESSABLE_ENTITY)
            }
            return true
          }
        },
        trim: true
      },
      password: {
        trim: true,
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isLength: { options: { min: 8, max: 50 }, errorMessage: USER_MESSAGES.PASSWORD_LENGTH },
        isStrongPassword: {
          options: {
            minLength: 8,
            minNumbers: 1,
            minLowercase: 1,
            minUppercase: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_IS_STRONG
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isLength: { options: { min: 8, max: 50 }, errorMessage: USER_MESSAGES.PASSWORD_LENGTH },
        isStrongPassword: {
          options: {
            minLength: 8,
            minNumbers: 1,
            minLowercase: 1,
            minUppercase: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_IS_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new AppError(USER_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH, HTTP_STATUS.UNPROCESSABLE_ENTITY)
            }
            return true
          }
        },
        trim: true
      }
      // date_of_birth: {
      //   isISO8601: {
      //     options: {
      //       strictSeparator: true,
      //       strict: true
      //     },
      //     errorMessage: USER_MESSAGES.DATE_OF_BIRTH_IS8601_INVALID
      //   },
      //   notEmpty: {
      //     errorMessage: USER_MESSAGES.DATE_OF_BIRTH_IS_REQUIRED
      //   }
      // }
    },
    ['body']
  )
)

const signInValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
        }
      },
      password: {
        trim: true,
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isLength: { options: { min: 8, max: 50 }, errorMessage: USER_MESSAGES.PASSWORD_LENGTH },
        isStrongPassword: {
          options: {
            minLength: 8,
            minNumbers: 1,
            minLowercase: 1,
            minUppercase: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_IS_STRONG
        }
      }
    },
    ['body']
  )
)

const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const user = await databaseServices.users.findOne({ email: value })
            if (!user) {
              throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

const forgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        notEmpty: {
          errorMessage: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const decode = await verifyToken(value)
            const user = await databaseServices.users.findOne({
              _id: new ObjectId(decode.userId)
            })
            if (user?.forgot_password_token !== value) {
              throw new AppError(USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID, HTTP_STATUS.UNAUTHORIZED)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

const resetPasswordValidator = validate(
  checkSchema(
    {
      password: {
        trim: true,
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isLength: { options: { min: 8, max: 50 }, errorMessage: USER_MESSAGES.PASSWORD_LENGTH },
        isStrongPassword: {
          options: {
            minLength: 8,
            minNumbers: 1,
            minLowercase: 1,
            minUppercase: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_IS_STRONG
        }
      },
      confirm_password: {
        trim: true,
        notEmpty: {
          errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isLength: { options: { min: 8, max: 50 }, errorMessage: USER_MESSAGES.PASSWORD_LENGTH },
        isStrongPassword: {
          options: {
            minLength: 8,
            minNumbers: 1,
            minLowercase: 1,
            minUppercase: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_IS_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH)
            }
            return true
          }
        }
      },
      forgot_password_token: {
        notEmpty: {
          errorMessage: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const decode = await verifyToken(value)
            const user = await databaseServices.users.findOne({
              _id: new ObjectId(decode.userId)
            })
            if (user?.forgot_password_token !== value) {
              throw new AppError(USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID, HTTP_STATUS.UNAUTHORIZED)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

const changePasswordValidator = validate(
  checkSchema(
    {
      password: {
        trim: true,
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isLength: { options: { min: 8, max: 50 }, errorMessage: USER_MESSAGES.PASSWORD_LENGTH },
        isStrongPassword: {
          options: {
            minLength: 8,
            minNumbers: 1,
            minLowercase: 1,
            minUppercase: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_IS_STRONG
        }
      },
      confirm_password: {
        trim: true,
        notEmpty: {
          errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isLength: { options: { min: 8, max: 50 }, errorMessage: USER_MESSAGES.PASSWORD_LENGTH },
        isStrongPassword: {
          options: {
            minLength: 8,
            minNumbers: 1,
            minLowercase: 1,
            minUppercase: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_IS_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

const updateProfileValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: USER_MESSAGES.NAME_LENGTH
        },
        isString: true,
        trim: true
      },
      date_of_birth: {
        optional: true,
        isISO8601: {
          options: {
            strictSeparator: true,
            strict: true
          },
          errorMessage: USER_MESSAGES.DATE_OF_BIRTH_IS8601_INVALID
        }
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.BIO_IS_STRING
        },
        isLength: { options: { min: 1, max: 200 }, errorMessage: USER_MESSAGES.BIO_LENGTH }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.USERNAME_IS_STRING
        },
        custom: {
          options: async (val) => {
            const user = await databaseServices.users.findOne({ username: val })
            if (user) {
              throw new AppError(USER_MESSAGES.USERNAME_EXISTS, HTTP_STATUS.BAD_REQUEST)
            }
            return true
          }
        },
        trim: true
      },
      avatar: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.IMAGE_URL_IS_STRING
        },
        isLength: { options: { min: 1, max: 400 }, errorMessage: USER_MESSAGES.IMAGE_URL_LENGTH }
      },
      cover: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.IMAGE_URL_IS_STRING
        },
        isLength: { options: { min: 1, max: 400 }, errorMessage: USER_MESSAGES.IMAGE_URL_LENGTH }
      },
      password: {
        optional: true,
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isLength: { options: { min: 8, max: 50 }, errorMessage: USER_MESSAGES.PASSWORD_LENGTH },
        isStrongPassword: {
          options: {
            minLength: 8,
            minNumbers: 1,
            minLowercase: 1,
            minUppercase: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_IS_STRONG
        },
        trim: true
      },
      confirm_password: {
        optional: true,

        notEmpty: {
          errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isLength: { options: { min: 8, max: 50 }, errorMessage: USER_MESSAGES.PASSWORD_LENGTH },
        isStrongPassword: {
          options: {
            minLength: 8,
            minNumbers: 1,
            minLowercase: 1,
            minUppercase: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_IS_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH)
            }
            return true
          }
        },
        trim: true
      }
    },

    ['body']
  )
)

const getOrUpdateUserValidator = validate(
  checkSchema(
    {
      user_id: {
        notEmpty: {
          errorMessage: USER_MESSAGES.USER_ID_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.USER_ID_INVALID
        }
      }
    },
    ['params']
  )
)

const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.REFRESH_TOKEN_IS_STRING
        },
        custom: {
          options: async (value, { req }) => {
            const decode = await verifyToken(value)
            if (!decode) {
              throw new AppError(USER_MESSAGES.REFRESH_TOKEN_IS_INVALID, HTTP_STATUS.UNAUTHORIZED)
            }
            req.user = await databaseServices.users.findOne({ _id: new ObjectId(decode.userId) })
            return true
          }
        }
      }
    },
    ['body']
  )
)

const getListUserValidator = validate(
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
      search: {
        optional: true,
        isString: { errorMessage: COMMON.SEARCH_MUST_BE_STRING }
      },
      sortBy: {
        optional: true,
        isIn: {
          options: [['name', 'email', 'created_at']],
          errorMessage: COMMON.SORT_BY_INVALID
        }
      },
      sortOrder: {
        optional: true,
        isIn: {
          options: [['asc', 'desc', 'ASC', 'DESC']],
          errorMessage: COMMON.SORT_ORDER_INVALID
        }
      },
      isActive: {
        optional: true,
        isBoolean: {
          errorMessage: COMMON.IS_ACTIVE_MUST_BE_BOOLEAN
        },
        toBoolean: true
      },
      role: {
        optional: true,
        isIn: {
          options: [convertNumberEnumToArr(RoleType)],
          errorMessage: COMMON.ROLE_INVALID
        }
      }
    },
    ['query']
  )
)
export {
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  getOrUpdateUserValidator,
  refreshTokenValidator,
  resetPasswordValidator,
  signInValidator,
  signUpValidator,
  updateProfileValidator,
  changePasswordValidator,
  getListUserValidator
}
