// StructuredExtractor prompts — coerce upstream agent prose into JSON rows
// conforming to a declared schema.

import { RESPOND_JSON_ONLY, truncate } from './shared'
import type { ExtractOptions } from '../engine/structured-extractor'

export function buildExtractorSystemPrompt(opts: ExtractOptions): string {
  const schemaList =
    opts.schema.length > 0
      ? opts.schema
          .map((c) => `  - "${c.key}" (${c.type}${c.required ? ', required' : ''}): ${c.label}`)
          .join('\n')
      : '  (no fixed schema — infer sensible keys from the content)'

  const shape =
    opts.format === 'json-object'
      ? 'a SINGLE JSON object'
      : 'a JSON array of objects (one object per record/row)'

  return `You are a data-extraction engine. Read the provided content and extract structured data.

## Target schema (each row's fields)
${schemaList}

## Rules
- Extract every distinct record you can find; do not invent data not present in the content.
- Coerce values to the declared types where possible (numbers as numbers, booleans as true/false).
- If a field is missing for a record, use null.
${opts.instructions ? `- Additional instructions: ${opts.instructions}\n` : ''}
## Response format
Respond with ONLY ${shape} (no markdown, no code fences, no commentary).`
}

export function buildExtractorUserMessage(opts: ExtractOptions): string {
  const content = truncate(opts.text, 24_000, '\n[... truncated ...]')
  return `## Content to extract from\n\n${content}\n\nExtract the structured data now. ${RESPOND_JSON_ONLY}`
}
