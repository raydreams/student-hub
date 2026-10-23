import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDefaultDatabase } from '../seed/default-db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', '..', 'data', 'db.json')

const db = createDefaultDatabase()
fs.mkdirSync(path.dirname(dbPath), { recursive: true })
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8')
console.log(`Seeded ${dbPath}`)
