import {createPool} from '@pgkit/client'
import {beforeAll, expect, test} from 'vitest'
import {run as runMigra} from '../src/command'
import {getFixtures, format} from './fixtures'
import {runOriginalMigra} from './run-original-migra'

export let admin: Awaited<ReturnType<typeof createPool>>

beforeAll(async () => {
  admin = createPool('postgresql://postgres:postgres@localhost:5432/postgres')
})

const fixtures = getFixtures('python_parity').map(f => [f] as const)

test('python migra CLI is installed and on PATH', async () => {
  const {stdout, stderr} = await runOriginalMigra('--help')
  expect(stdout).toContain('usage: migra')
  expect(stdout).toContain('Generate a database migration.')
}, 60_000) //Give extra time to pull docker image if necessary

test.each(fixtures)(
  '%j migra fixture',
  async ({name, args, ...fixture}) => {
    expect(name).toMatch(/^[\d_a-z]+$/)
    const [a, b] = await fixture.setup(admin)

    const rawOutput = await runOriginalMigra(a, b, ...fixture.cliArgs())
    const expected = format(rawOutput.stderr).trim() || format(rawOutput.stdout)
    // const expected = format(fixture.getExpected())
    const migra = await runMigra(a, b, args())
    const actual = format(migra.sql)

    expect(actual).toEqual(expected)
  },
  10_000,
)
