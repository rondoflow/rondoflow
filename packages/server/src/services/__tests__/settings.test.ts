import { describe, it, expect, afterEach, vi } from 'vitest'

// settings.ts imports prisma + encryption at module load. getEnabledSocialProviders
// reads only process.env, but the budget helpers hit prisma.setting — so stub
// those methods too. encryption is stubbed to keep the unit hermetic.
const settingStore = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
}))
vi.mock('../../lib/prisma', () => ({ prisma: { setting: settingStore } }))
vi.mock('../../resources/encryption', () => ({
  encrypt: (v: string) => v,
  decrypt: (v: string) => v,
}))

import {
  getEnabledSocialProviders,
  getDirectorBudget,
  setDirectorBudget,
  DEFAULT_DIRECTOR_BUDGET_USD,
  getDirectorTimeout,
  setDirectorTimeout,
  DEFAULT_DIRECTOR_TIMEOUT_SEC,
} from '../settings'

// getEnabledSocialProviders MUST mirror the `enabled: Boolean(process.env.*_CLIENT_ID)`
// gate in auth/auth.ts — a provider is enabled iff its OAuth client ID is present.
describe('getEnabledSocialProviders', () => {
  const original = {
    github: process.env.GITHUB_CLIENT_ID,
    google: process.env.GOOGLE_CLIENT_ID,
  }

  function restore(key: 'GITHUB_CLIENT_ID' | 'GOOGLE_CLIENT_ID', value: string | undefined) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }

  afterEach(() => {
    restore('GITHUB_CLIENT_ID', original.github)
    restore('GOOGLE_CLIENT_ID', original.google)
  })

  it('reports each provider enabled iff its client ID is present', () => {
    process.env.GITHUB_CLIENT_ID = 'gh-client-id'
    delete process.env.GOOGLE_CLIENT_ID
    expect(getEnabledSocialProviders()).toEqual({ github: true, google: false })
  })

  it('reports both disabled when neither client ID is set', () => {
    delete process.env.GITHUB_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_ID
    expect(getEnabledSocialProviders()).toEqual({ github: false, google: false })
  })

  it('treats an empty-string client ID as disabled', () => {
    process.env.GITHUB_CLIENT_ID = ''
    process.env.GOOGLE_CLIENT_ID = 'gg-client-id'
    expect(getEnabledSocialProviders()).toEqual({ github: false, google: true })
  })
})

describe('director budget', () => {
  afterEach(() => {
    settingStore.findUnique.mockReset()
    settingStore.upsert.mockReset()
    settingStore.deleteMany.mockReset()
  })

  it('returns the default when no row is stored', async () => {
    settingStore.findUnique.mockResolvedValue(null)
    expect(await getDirectorBudget()).toBe(DEFAULT_DIRECTOR_BUDGET_USD)
  })

  it('returns the stored value when valid', async () => {
    settingStore.findUnique.mockResolvedValue({ value: '0.2' })
    expect(await getDirectorBudget()).toBe(0.2)
  })

  it('falls back to the default for a malformed or non-positive stored value', async () => {
    settingStore.findUnique.mockResolvedValue({ value: 'not-a-number' })
    expect(await getDirectorBudget()).toBe(DEFAULT_DIRECTOR_BUDGET_USD)
    settingStore.findUnique.mockResolvedValue({ value: '0' })
    expect(await getDirectorBudget()).toBe(DEFAULT_DIRECTOR_BUDGET_USD)
  })

  it('upserts and returns the value when set', async () => {
    settingStore.upsert.mockResolvedValue({})
    expect(await setDirectorBudget(0.15)).toBe(0.15)
    expect(settingStore.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: 'DIRECTOR_MAX_BUDGET_USD' },
        create: { key: 'DIRECTOR_MAX_BUDGET_USD', value: '0.15' },
        update: { value: '0.15' },
      }),
    )
  })

  it('clears the row and returns the default when set to null', async () => {
    settingStore.deleteMany.mockResolvedValue({ count: 1 })
    expect(await setDirectorBudget(null)).toBe(DEFAULT_DIRECTOR_BUDGET_USD)
    expect(settingStore.deleteMany).toHaveBeenCalledWith({ where: { key: 'DIRECTOR_MAX_BUDGET_USD' } })
    expect(settingStore.upsert).not.toHaveBeenCalled()
  })
})

describe('director timeout', () => {
  afterEach(() => {
    settingStore.findUnique.mockReset()
    settingStore.upsert.mockReset()
    settingStore.deleteMany.mockReset()
  })

  it('returns the default when no row is stored', async () => {
    settingStore.findUnique.mockResolvedValue(null)
    expect(await getDirectorTimeout()).toBe(DEFAULT_DIRECTOR_TIMEOUT_SEC)
  })

  it('returns the stored value when valid', async () => {
    settingStore.findUnique.mockResolvedValue({ value: '180' })
    expect(await getDirectorTimeout()).toBe(180)
  })

  it('falls back to the default for a malformed or non-positive stored value', async () => {
    settingStore.findUnique.mockResolvedValue({ value: 'not-a-number' })
    expect(await getDirectorTimeout()).toBe(DEFAULT_DIRECTOR_TIMEOUT_SEC)
    settingStore.findUnique.mockResolvedValue({ value: '0' })
    expect(await getDirectorTimeout()).toBe(DEFAULT_DIRECTOR_TIMEOUT_SEC)
  })

  it('upserts and returns the value when set', async () => {
    settingStore.upsert.mockResolvedValue({})
    expect(await setDirectorTimeout(180)).toBe(180)
    expect(settingStore.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: 'DIRECTOR_MAX_WALL_CLOCK_SEC' },
        create: { key: 'DIRECTOR_MAX_WALL_CLOCK_SEC', value: '180' },
        update: { value: '180' },
      }),
    )
  })

  it('clears the row and returns the default when set to null', async () => {
    settingStore.deleteMany.mockResolvedValue({ count: 1 })
    expect(await setDirectorTimeout(null)).toBe(DEFAULT_DIRECTOR_TIMEOUT_SEC)
    expect(settingStore.deleteMany).toHaveBeenCalledWith({ where: { key: 'DIRECTOR_MAX_WALL_CLOCK_SEC' } })
    expect(settingStore.upsert).not.toHaveBeenCalled()
  })
})
