export const authConfig = () => ({
  secret: process.env.API_SECRET,
  expiresIn: process.env.EXPIRES_IN,
})