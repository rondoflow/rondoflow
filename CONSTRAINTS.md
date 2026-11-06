# Quality Bar — rondoflow

## Princípio

Nunca baixar a qualidade bar para entregar mais rápido. Cada feature nova deve:
- Ser testada antes de ser merged
- Passar lint, typecheck e test coverage mínimo
- Seguir padrões de código do projeto

## Thresholds

| Métrica | Threshold | Como medir |
|---|---|---|
| Coverage | >=70% (turbo test:coverage) | `turbo test:coverage --filter=@rondoflow/server` |
| Linhas por arquivo | <800 linhas | `wc -l packages/**/*.ts` |
| Linhas por função | <50 linhas | Lint check |
| @ts-ignore/@ts-expect-error | Zero + TODO(comente issue) | `grep -rn '@ts-' packages/` |
| eslint-disable | Zero + justificativa | `grep -rn 'eslint-disable' packages/` |

## Testes

- **Nunca deletar testes para ficar verde**
- **Todo novo código tem testes antes do merge**
- **Todo bug fix tem regression test**
- `npm run test:coverage` deve passar antes de `git push`

## CI/CD

- `turbo build` → `turbo lint` → `turbo test:coverage` before `git push`
- Codeowners review obrigatório em `packages/server/src/engine/*.ts` e `packages/ui/src/canvas/*.tsx`
- `husky` blocks commits quebrados (commit-msg + pre-push hooks)

## Security

- `--output-format stream-json` (nunca `shell: true` ou `execSync`)
- Policy checker válido para cada `SpawnOptions.permissionMode`
- `BETTER_AUTH_SECRET` obrigatório (sem fallback hardcoded)

## Refatoração

- **Minimum diff**: muda só o que é necessário
- **Surgical**: não refatora código intacto no mesmo commit
- **Test first**: altera test antes do código (TDD)

## Rollback plan

- Se production falhar: `git revert HEAD~1` + hotfix PR
- `CONSTRAINTS.md` não deve ser alterado sem approved by `@voltolini-space/backend`
