import db from "../lib/db";

async function run() {
  try {
    await db.prepare('ALTER TABLE RawMaterial ADD COLUMN date DATETIME').run();
    console.log("Migration successful: Added date to RawMaterial");
  } catch (err: any) {
    if (err.message && err.message.includes("duplicate column name")) {
      console.log("Column already exists.");
    } else {
      console.error(err);
    }
  }
}

run();
