import { spawnSync } from 'node:child_process'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const SCRIPT = resolve(import.meta.dirname, 'deploy.mjs')
const PROJECT = `age-of-majority-${'a1'.repeat(16)}`
const WISHES = `export const families = [
  { name: 'Family A', messages: [{ author: 'Anna', text: 'Happy birthday!' }] },
]
`

let cwd: string

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), 'deploy-'))
})

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true })
})

function writeWishes(content: string) {
  mkdirSync(join(cwd, 'src'))
  writeFileSync(join(cwd, 'src/families.local.ts'), content)
}

function deploy(project?: string, path = process.env.PATH) {
  const env: NodeJS.ProcessEnv = { ...process.env, PATH: path }
  delete env.CLOUDFLARE_PAGES_PROJECT
  if (project !== undefined) env.CLOUDFLARE_PAGES_PROJECT = project
  const result = spawnSync('node', [SCRIPT], { cwd, env, encoding: 'utf8' })
  return { status: result.status, stderr: result.stderr }
}

function expectAbortedBeforeBuild(result: ReturnType<typeof deploy>) {
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('Deploy aborted')
  expect(existsSync(join(cwd, 'dist'))).toBe(false)
}

describe('deploy guards', () => {
  it('refuses without the local wishes file and names it', () => {
    const result = deploy(PROJECT)

    expectAbortedBeforeBuild(result)
    expect(result.stderr).toContain('src/families.local.ts')
  })

  it('refuses without the project name and names the setting and file', () => {
    writeWishes(WISHES)

    const result = deploy()

    expectAbortedBeforeBuild(result)
    expect(result.stderr).toContain('CLOUDFLARE_PAGES_PROJECT')
    expect(result.stderr).toContain('.env.local')
  })

  it('refuses a project name that is not the secret format', () => {
    writeWishes(WISHES)

    const result = deploy('age-of-majority')

    expectAbortedBeforeBuild(result)
    expect(result.stderr).toContain('CLOUDFLARE_PAGES_PROJECT')
  })

  it('refuses a wishes file without the families export', () => {
    writeWishes('export const familes = []\n')

    expectAbortedBeforeBuild(deploy(PROJECT))
  })

  it('refuses a wishes file with a message without an author', () => {
    writeWishes(
      "export const families = [{ name: 'A', messages: [{ text: 'Hi' }] }]\n",
    )

    const result = deploy(PROJECT)

    expectAbortedBeforeBuild(result)
    expect(result.stderr).toContain('author')
  })
})

describe('deploy success path', () => {
  function fakeTools(bundleContent: string) {
    const bin = join(cwd, 'bin')
    mkdirSync(bin)
    const tool = (name: string, body: string) => {
      writeFileSync(join(bin, name), `#!/bin/sh\n${body}\n`)
      chmodSync(join(bin, name), 0o755)
    }
    tool(
      'npm',
      `echo "$@" > npm-args.txt && mkdir -p dist/assets && printf '%s' '${bundleContent}' > dist/assets/index.js`,
    )
    tool('npx', 'echo "$@" > npx-args.txt')
    return `${bin}:${process.env.PATH}`
  }

  it('builds and uploads the production deployment to the project', () => {
    writeWishes(WISHES)

    const result = deploy(PROJECT, fakeTools('Family A'))

    expect(result.status).toBe(0)
    expect(readFileSync(join(cwd, 'npm-args.txt'), 'utf8').trim()).toBe(
      'run build',
    )
    expect(readFileSync(join(cwd, 'npx-args.txt'), 'utf8')).toMatch(
      new RegExp(
        `wrangler@\\S+ pages deploy dist --project-name ${PROJECT} --branch main`,
      ),
    )
  })

  it('refuses to upload a build without the real wishes', () => {
    writeWishes(WISHES)

    const result = deploy(PROJECT, fakeTools('Family Lorem'))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Deploy aborted')
    expect(existsSync(join(cwd, 'npx-args.txt'))).toBe(false)
  })

  it('refuses to upload a build that lacks one of the families', () => {
    writeWishes(`export const families = [
  { name: 'Family A', messages: [{ author: 'Anna', text: 'Hi there!' }] },
  { name: 'Family B', messages: [{ author: 'Bob', text: 'Many happy returns!' }] },
]
`)

    const result = deploy(PROJECT, fakeTools('Family A'))

    expect(result.status).not.toBe(0)
    expect(existsSync(join(cwd, 'npx-args.txt'))).toBe(false)
  })
})
