import { describe, it, expect } from 'vitest'
import { parseRecipients } from '../recipients'

describe('parseRecipients', () => {
  it('returns empty lists for empty / whitespace input', () => {
    expect(parseRecipients('')).toEqual({ valid: [], invalid: [] })
    expect(parseRecipients('   ')).toEqual({ valid: [], invalid: [] })
  })

  it('splits on commas and semicolons and trims', () => {
    const { valid } = parseRecipients(' a@x.com , b@y.com ; c@z.com')
    expect(valid).toEqual(['a@x.com', 'b@y.com', 'c@z.com'])
  })

  it('de-duplicates case-insensitively, keeping first occurrence', () => {
    const { valid } = parseRecipients('A@X.com, a@x.com, b@y.com')
    expect(valid).toEqual(['A@X.com', 'b@y.com'])
  })

  it('separates invalid addresses', () => {
    const { valid, invalid } = parseRecipients('good@x.com, not-an-email, b@y.com')
    expect(valid).toEqual(['good@x.com', 'b@y.com'])
    expect(invalid).toEqual(['not-an-email'])
  })

  it('drops empty segments from trailing separators', () => {
    const { valid } = parseRecipients('a@x.com,,b@y.com,')
    expect(valid).toEqual(['a@x.com', 'b@y.com'])
  })
})
