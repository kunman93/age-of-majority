import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { validateFamilies } from '../src/validateFamilies.ts'

const WISHES_FILE = 'src/families.local.ts'
const PROJECT_VARIABLE = 'CLOUDFLARE_PAGES_PROJECT'
const SECRET_PROJECT_NAME = /^age-of-majority-[0-9a-f]{32}$/
const WRANGLER = 'wrangler@4.151.1'

function fail(message) {
  console.error(`Deploy aborted: ${message}`)
  process.exit(1)
}

function run(command, args) {
  const { status, error } = spawnSync(command, args, { stdio: 'inherit' })
  if (error) fail(`could not run ${command}: ${error.message}`)
  if (status !== 0) process.exit(status ?? 1)
}

function bundledScripts() {
  const assets = join('dist', 'assets')
  return readdirSync(assets)
    .filter((file) => file.endsWith('.js'))
    .map((file) => readFileSync(join(assets, file), 'utf8'))
}

if (!existsSync(WISHES_FILE)) {
  fail(`${WISHES_FILE} is missing. Create it with the real wishes first.`)
}

const project = process.env[PROJECT_VARIABLE]
if (!project) {
  fail(`${PROJECT_VARIABLE} is not set. Put it in .env.local.`)
}
if (!SECRET_PROJECT_NAME.test(project)) {
  fail(
    `${PROJECT_VARIABLE} must be age-of-majority- followed by 32 hexadecimal characters.`,
  )
}

let familyNames
try {
  const wishes = await import(pathToFileURL(resolve(WISHES_FILE)).href)
  validateFamilies(wishes.families)
  familyNames = wishes.families.map((family) => family.name)
} catch (error) {
  fail(`${WISHES_FILE} is not valid: ${error.message}`)
}

run('npm', ['run', 'build'])

const bundle = bundledScripts().join('\n')
if (!familyNames.every((name) => bundle.includes(name))) {
  fail('the build does not contain the real wishes.')
}

run('npx', [
  '--yes',
  WRANGLER,
  'pages',
  'deploy',
  'dist',
  '--project-name',
  project,
  '--branch',
  'main',
])
