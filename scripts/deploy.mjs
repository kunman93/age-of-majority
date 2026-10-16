import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const WISHES_FILE = 'src/families.local.ts'
const PROJECT_VARIABLE = 'CLOUDFLARE_PAGES_PROJECT'

function fail(message) {
  console.error(`Deploy aborted: ${message}`)
  process.exit(1)
}

function run(command, args) {
  const { status } = spawnSync(command, args, { stdio: 'inherit' })
  if (status !== 0) process.exit(status ?? 1)
}

if (!existsSync(WISHES_FILE)) {
  fail(`${WISHES_FILE} is missing. Create it with the real wishes first.`)
}

const project = process.env[PROJECT_VARIABLE]
if (!project) {
  fail(`${PROJECT_VARIABLE} is not set. Put it in .env.local.`)
}

run('npm', ['run', 'build'])
run('npx', [
  'wrangler',
  'pages',
  'deploy',
  'dist',
  '--project-name',
  project,
  '--branch',
  'main',
])
