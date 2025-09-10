import bcrypt from 'bcryptjs'
export const hashPassword = (plainTextPassword: string) => {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(plainTextPassword, salt)
}
export const comparePassword = (plainTextPassword: string, hashedPassword: string): boolean => {
  return bcrypt.compareSync(plainTextPassword, hashedPassword)
}
