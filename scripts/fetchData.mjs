import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data')

const ENDPOINTS = {
  'problems.json': 'https://kenkoooo.com/atcoder/resources/problems.json',
  'problem-models.json': 'https://kenkoooo.com/atcoder/resources/problem-models.json',
  'contest-problem.json': 'https://kenkoooo.com/atcoder/resources/contest-problem.json',
  'contests.json': 'https://kenkoooo.com/atcoder/resources/contests.json',
}

async function fetchAndSave(filename, url) {
  console.log(`Fetching ${filename}...`)
  const res = await fetch(url, {
    headers: { 'Accept-Encoding': 'gzip' },
  })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const data = await res.json()
  const outPath = join(OUTPUT_DIR, filename)
  writeFileSync(outPath, JSON.stringify(data))
  console.log(`  Saved ${outPath} (${JSON.stringify(data).length} bytes)`)
}

mkdirSync(OUTPUT_DIR, { recursive: true })

for (const [filename, url] of Object.entries(ENDPOINTS)) {
  await fetchAndSave(filename, url)
}

console.log('Done.')
