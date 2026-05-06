import { drizzle } from 'drizzle-orm/libsql'
export const db = drizzle({
  connection: 'file:db.sqlite',
  logger: true,
})
export default db