
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { query } from "../lib/db-connection.js";

async function run() {
  const email = "admin@example.com";
  const password = "Admin@12345";

  const hash = await bcrypt.hash(password, 10);

  const res = await query(
    `INSERT INTO users (email, name, phone, address, password_hash, role)
     VALUES ($1,$2,$3,$4,$5,'admin')
     RETURNING id`,
    [email, "Admin", "9999999999", "HQ", hash]
  );

  console.log("ADMIN CREATED");
  console.log("ID:", res.rows[0].id);
  console.log("EMAIL:", email);
  console.log("PASSWORD:", password);
}

run().catch(console.error);
