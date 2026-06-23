---
name: avoid-common-terraform-mistakes
description: "Avoid common Terraform mistakes — state corruption, count vs for_each, lifecycle traps, and dependency ordering."
category: "DevOps & Infra"
author: community
version: "1.0.0"
icon: server
---

## State Management
- Local state gets corrupted/lost — use remote backend (S3, GCS, Terraform Cloud)
- Multiple people running simultaneously — enable state locking with DynamoDB or equivalent
- Never edit state manually — use `terraform state mv`, `rm`, `import`
- State contains secrets in plain text — encrypt at rest, restrict access

## Count vs for_each
- `count` uses index — removing item 0 shifts all indices, forces recreation
- `for_each` uses keys — stable, removing one doesn't affect others
- Can't use both on same resource — choose one
- `for_each` requires set or map — `toset()` to convert list

## Lifecycle Rules
- `prevent_destroy = true` — blocks accidental deletion, must be removed to destroy
- `create_before_destroy = true` — new resource created before old destroyed, for zero downtime
- `ignore_changes` for external modifications — `ignore_changes = [tags]` ignores drift
- `replace_triggered_by` to force recreation — when dependency changes

## Dependencies
- Implicit via reference — `aws_instance.foo.id` creates automatic dependency
- `depends_on` for hidden dependencies — when reference isn't in config
- `depends_on` accepts list — `depends_on = [aws_iam_role.x, aws_iam_policy.y]`
- Data sources run during plan — may fail if resource doesn't exist yet

## Data Sources
- Data sources read existing resources — don't create
- Runs at plan time — dependency must exist before plan
- Use `depends_on` if implicit dependency not clear — or plan fails
- Consider using resource output instead — more explicit

## Modules
- Pin module versions — `source = "org/name/aws?version=1.2.3"`
- `terraform init -upgrade` to update — doesn't auto-update
- Module outputs must be explicitly defined — can't access internal resources from outside
- Nested modules: output must bubble up — each layer needs to export

## Variables
- No type = any — explicit `type = string`, `list(string)`, `map(object({...}))`
- `sensitive = true` hides from output — but still in state file
- `validation` block for constraints — custom error message
- `nullable = false` to reject null — default is nullable

## Common Mistakes
- `terraform destroy` is permanent — no undo, use `-target` carefully
- Plan succeeded ≠ apply succeeds — API errors, quotas, permissions discovered at apply
- Renaming resource = delete + create — use `moved` block or `terraform state mv`
- Workspaces not for environments — use separate state files/backends per env
- Provisioners are last resort — use cloud-init, user_data, or config management instead

## Import
- `terraform import aws_instance.foo i-1234` — imports existing resource to state
- Doesn't generate config — must write matching resource block manually
- `import` block (TF 1.5+) — declarative import in config
- Plan after import to verify — should show no changes if config matches
