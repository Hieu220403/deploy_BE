import { checkSchema } from 'express-validator'
import { RoleType } from '~/constants/enum'
import { ROLE_MESSAGES } from '~/constants/message'
import rolesServices from '~/services/roles.services'
import { convertNumberEnumToArr } from '~/utils/common'
import { validate } from '~/utils/validate'

const createRoleValidator = validate(
  checkSchema(
    {
      role_name: {
        notEmpty: {
          errorMessage: ROLE_MESSAGES.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: ROLE_MESSAGES.NAME_IS_INVALID
        },
        custom: {
          options: async (val, { req }) => {
            const role = await rolesServices.getRole(val)
            if (role) {
              throw new Error(ROLE_MESSAGES.ROLE_IS_DUPLICATE)
            }
            return true
          }
        }
      },
      role_id: {
        notEmpty: {
          errorMessage: ROLE_MESSAGES.ROLE_ID_IS_REQUIRED
        },
        custom: {
          options: async (val, { req }) => {
            if (!convertNumberEnumToArr(RoleType).includes(val)) {
              throw new Error(ROLE_MESSAGES.ROLE_ID_IS_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

const deleteRoleValidator = validate(
  checkSchema(
    {
      role_id: {
        notEmpty: {
          errorMessage: ROLE_MESSAGES.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: ROLE_MESSAGES.ROLE_ID_IS_INVALID
        }
      }
    },
    ['params']
  )
)

export { createRoleValidator, deleteRoleValidator }
