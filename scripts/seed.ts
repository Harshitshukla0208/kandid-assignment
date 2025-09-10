import 'dotenv/config'
import { db, users } from '../src/lib/db'
import { seedDatabase } from '../src/lib/db/seed'

async function main() {
  try {
    const existingUsers = await db.select().from(users)
    if (existingUsers.length === 0) {
      throw new Error('No users found. Please create at least one user, then re-run the seed.')
    }

    for (const u of existingUsers) {
      console.log('Seeding for user:', u.id, u.email)
      await seedDatabase(u.id)
    }
    console.log('Seeding complete for', existingUsers.length, 'users!')
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

main()
