import { createApp } from './app.js'
import { loadDatabase } from './db.js'

const PORT = Number(process.env.PORT) || 4000

loadDatabase()

const app = createApp()

app.listen(PORT, () => {
  console.log(`student-hub-api listening on http://localhost:${PORT}`)
})
