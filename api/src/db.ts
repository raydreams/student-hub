import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDefaultDatabase } from './seed/default-db.js'
import type { Database } from './types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const DB_PATH = path.join(DATA_DIR, 'db.json')

let cache: Database | null = null

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function loadDatabase(): Database {
  if (cache) return cache
  ensureDataDir()
  if (!fs.existsSync(DB_PATH)) {
    cache = createDefaultDatabase()
    saveDatabase(cache)
    return cache
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  const { db, migrated } = migrateDatabase(JSON.parse(raw) as Database)
  cache = db
  if (migrated) saveDatabase(db)
  return cache
}

function migrateDatabase(db: Database): { db: Database; migrated: boolean } {
  const fresh = createDefaultDatabase()
  let migrated = false
  if (!db.gradeHistory?.length) {
    db.gradeHistory = fresh.gradeHistory
    migrated = true
  }
  if (!db.inbox?.length) {
    db.inbox = fresh.inbox
    migrated = true
  }
  return { db, migrated }
}

export function saveDatabase(db: Database): void {
  ensureDataDir()
  cache = db
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
}

export function updateDatabase(mutator: (db: Database) => void): Database {
  const db = loadDatabase()
  mutator(db)
  saveDatabase(db)
  return db
}

export function getDbPath(): string {
  return DB_PATH
}
