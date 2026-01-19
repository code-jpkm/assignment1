const { Pool } = require("pg")

// Create a connection pool for PostgreSQL
let pool = null

const getPool = () => {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,

      // Neon needs SSL (even in development)
      ssl: { rejectUnauthorized: false },

      max: 20,
      idleTimeoutMillis: 30000,

      // 2 seconds is too low for cloud DBs
      connectionTimeoutMillis: 20000,
    })

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err)
      process.exit(-1)
    })
  }

  return pool
}

// Query function with error handling
const query = async (text, params = []) => {
  const client = await getPool().connect()
  try {
    const result = await client.query(text, params)
    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  } finally {
    client.release()
  }
}

module.exports = {
  getPool,
  query,
}
