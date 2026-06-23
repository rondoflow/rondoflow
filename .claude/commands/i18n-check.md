---
description: Run the i18n locale parity test (en/sk/es) and report or fix any failures
allowed-tools: Bash, Read, Edit
---

Run RondoFlow's locale catalog test and act on the result.

1. Run it:
   ```bash
   cd packages/ui && npx vitest run src/lib/i18n/__tests__/locales.test.ts
   ```
2. **If it passes**, report "locales in parity ✓" and stop.
3. **If it fails**, parse the output and for each failure name the **namespace**, **locale**, and
   the offending **key(s)**. Failures fall into:
   - `missing` / `extra` keys vs `en`
   - empty or `[[TODO]]` values
   - interpolation-variable mismatches (`{{var}}` set differs from `en`)
4. **Fix only the reported keys** in `packages/ui/src/lib/i18n/locales/{sk,es}/<ns>.json`:
   translate missing `sk`/`es` values naturally, keep every `{{variable}}` identical to `en`, and
   never translate brand names / identifiers / model IDs. For a large gap, delegate the
   translation to the `rondoflow-i18n-translator` agent.
5. Re-run the test until green, then report what changed.

See the `rondoflow-i18n` skill for the full rules.
