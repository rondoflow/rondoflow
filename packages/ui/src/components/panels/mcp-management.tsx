'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plug,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Loader2,
  Terminal,
  Globe,
  Lock,
  ExternalLink,
} from 'lucide-react'
import {
  isRemoteMcpTransport,
  MCP_TRANSPORTS,
  MCP_AUTH_TYPES,
  type McpServerData,
  type McpServerInput,
  type McpAuthInput,
  type McpTransport,
  type McpAuthType,
} from '@rondoflow/shared'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { apiPost } from '@/lib/api'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A persisted MCP server (auth secrets redacted) as returned by the API. */
export type McpServer = McpServerData

type ConnectionTestState = 'idle' | 'testing' | 'success' | 'failure'

export interface McpManagementProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly servers: readonly McpServer[]
  readonly onAdd: (server: McpServerInput) => void
  readonly onEdit: (id: string, updates: McpServerInput) => void
  readonly onDelete: (id: string) => void
}

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface FormState {
  name: string
  description: string
  transport: McpTransport
  // stdio
  command: string
  argsRaw: string
  envPairs: Array<{ key: string; value: string }>
  // http / sse
  url: string
  authType: McpAuthType
  token: string
  headerName: string
  headerValue: string
  tokenUrl: string
  clientId: string
  clientSecret: string
  scope: string
  // presence flags from the server so the edit form can show "leave blank to keep"
  tokenSet: boolean
  headerValueSet: boolean
  clientSecretSet: boolean
}

function blankForm(): FormState {
  return {
    name: '',
    description: '',
    transport: 'stdio',
    command: '',
    argsRaw: '',
    envPairs: [{ key: '', value: '' }],
    url: '',
    authType: 'none',
    token: '',
    headerName: '',
    headerValue: '',
    tokenUrl: '',
    clientId: '',
    clientSecret: '',
    scope: '',
    tokenSet: false,
    headerValueSet: false,
    clientSecretSet: false,
  }
}

function serverToForm(server: McpServer): FormState {
  const auth = server.auth ?? null
  const env = server.env ?? {}
  return {
    ...blankForm(),
    name: server.name,
    description: server.description ?? '',
    transport: server.type,
    command: server.command ?? '',
    argsRaw: server.args.join(', '),
    envPairs:
      Object.entries(env).length > 0
        ? Object.entries(env).map(([key, value]) => ({ key, value }))
        : [{ key: '', value: '' }],
    url: server.url ?? '',
    authType: auth?.type ?? 'none',
    headerName: auth?.headerName ?? '',
    tokenUrl: auth?.tokenUrl ?? '',
    clientId: auth?.clientId ?? '',
    scope: auth?.scope ?? '',
    tokenSet: auth?.tokenSet ?? false,
    headerValueSet: auth?.headerValueSet ?? false,
    clientSecretSet: auth?.clientSecretSet ?? false,
  }
}

function parseArgs(raw: string): string[] {
  return raw
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean)
}

function parseEnv(pairs: FormState['envPairs']): Record<string, string> {
  const env: Record<string, string> = {}
  for (const pair of pairs) {
    const k = pair.key.trim()
    if (k) env[k] = pair.value.trim()
  }
  return env
}

function buildAuthInput(form: FormState): McpAuthInput {
  switch (form.authType) {
    case 'bearer':
      return { type: 'bearer', token: form.token }
    case 'header':
      return { type: 'header', headerName: form.headerName.trim(), headerValue: form.headerValue }
    case 'oauth2_client_credentials':
      return {
        type: 'oauth2_client_credentials',
        tokenUrl: form.tokenUrl.trim(),
        clientId: form.clientId.trim(),
        clientSecret: form.clientSecret,
        ...(form.scope.trim() ? { scope: form.scope.trim() } : {}),
      }
    default:
      return { type: 'none' }
  }
}

function formToInput(form: FormState): McpServerInput {
  const base = {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    type: form.transport,
  }
  if (form.transport === 'stdio') {
    return {
      ...base,
      command: form.command.trim(),
      args: parseArgs(form.argsRaw),
      env: parseEnv(form.envPairs),
    }
  }
  return { ...base, url: form.url.trim(), auth: buildAuthInput(form) }
}

function isFormValid(form: FormState): boolean {
  if (!form.name.trim()) return false
  if (form.transport === 'stdio') return form.command.trim().length > 0
  if (!form.url.trim()) return false
  switch (form.authType) {
    case 'none':
      return true
    case 'bearer':
      return form.tokenSet || form.token.trim().length > 0
    case 'header':
      return (
        form.headerName.trim().length > 0 &&
        (form.headerValueSet || form.headerValue.trim().length > 0)
      )
    case 'oauth2_client_credentials':
      return (
        form.tokenUrl.trim().length > 0 &&
        form.clientId.trim().length > 0 &&
        (form.clientSecretSet || form.clientSecret.trim().length > 0)
      )
  }
}

// ---------------------------------------------------------------------------
// Segmented control
// ---------------------------------------------------------------------------

interface SegmentedProps<T extends string> {
  readonly value: T
  readonly options: ReadonlyArray<{ readonly value: T; readonly label: string }>
  readonly onChange: (value: T) => void
}

function Segmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="flex gap-1 rounded-md border bg-muted/40 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded px-2 py-1 text-xs font-medium transition-colors',
            value === o.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Labelled field helper
// ---------------------------------------------------------------------------

function Field({
  label,
  required,
  children,
}: {
  readonly label: string
  readonly required?: boolean
  readonly children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Server form dialog
// ---------------------------------------------------------------------------

interface ServerFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly title: string
  readonly initialForm: FormState
  readonly onSubmit: (server: McpServerInput) => void
}

function ServerFormDialog({
  open,
  onOpenChange,
  title,
  initialForm,
  onSubmit,
}: ServerFormDialogProps) {
  const { t } = useTranslation('admin')
  const [form, setForm] = useState<FormState>(initialForm)

  // Reset when dialog reopens with new initial data
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setForm(initialForm)
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function addEnvPair() {
    setForm((prev) => ({ ...prev, envPairs: [...prev.envPairs, { key: '', value: '' }] }))
  }

  function removeEnvPair(index: number) {
    setForm((prev) => ({ ...prev, envPairs: prev.envPairs.filter((_, i) => i !== index) }))
  }

  function updateEnvPair(index: number, field: 'key' | 'value', val: string) {
    setForm((prev) => ({
      ...prev,
      envPairs: prev.envPairs.map((pair, i) => (i === index ? { ...pair, [field]: val } : pair)),
    }))
  }

  function handleSubmit() {
    if (!isFormValid(form)) return
    onSubmit(formToInput(form))
    onOpenChange(false)
  }

  const isRemote = isRemoteMcpTransport(form.transport)
  const transportLabels: Record<McpTransport, string> = {
    stdio: t('mcp.field.transportStdio'),
    http: t('mcp.field.transportHttp'),
    sse: t('mcp.field.transportSse'),
  }
  const authLabels: Record<McpAuthType, string> = {
    none: t('mcp.field.authNone'),
    bearer: t('mcp.field.authBearer'),
    header: t('mcp.field.authHeader'),
    oauth2_client_credentials: t('mcp.field.authOauth2'),
  }
  const secretPlaceholder = (isSet: boolean, normal: string) =>
    isSet ? t('mcp.field.secretKeep') : normal

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Transport */}
          <Field label={t('mcp.field.transport')}>
            <Segmented<McpTransport>
              value={form.transport}
              onChange={(v) => updateField('transport', v)}
              options={MCP_TRANSPORTS.map((tr) => ({ value: tr, label: transportLabels[tr] }))}
            />
          </Field>

          {/* Name */}
          <Field label={t('mcp.field.name')} required>
            <Input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={t('mcp.field.namePlaceholder')}
              maxLength={80}
            />
          </Field>

          {/* Description */}
          <Field label={t('mcp.field.description')}>
            <Input
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder={t('mcp.field.descriptionPlaceholder')}
              maxLength={200}
            />
          </Field>

          {/* ── stdio fields ── */}
          {!isRemote && (
            <>
              <Field label={t('mcp.field.command')} required>
                <Input
                  value={form.command}
                  onChange={(e) => updateField('command', e.target.value)}
                  placeholder={t('mcp.field.commandPlaceholder')}
                  className="font-mono text-xs"
                />
              </Field>

              <Field label={t('mcp.field.args')}>
                <Input
                  value={form.argsRaw}
                  onChange={(e) => updateField('argsRaw', e.target.value)}
                  placeholder={t('mcp.field.argsPlaceholder')}
                  className="font-mono text-xs"
                />
              </Field>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t('mcp.field.env')}
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 px-2 text-xs"
                    onClick={addEnvPair}
                  >
                    <Plus className="h-3 w-3" />
                    {t('mcp.field.envAdd')}
                  </Button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {form.envPairs.map((pair, i) => (
                    <div key={i} className="flex gap-1.5">
                      <Input
                        value={pair.key}
                        onChange={(e) => updateEnvPair(i, 'key', e.target.value)}
                        placeholder={t('mcp.field.envKeyPlaceholder')}
                        className="font-mono text-xs"
                      />
                      <Input
                        value={pair.value}
                        onChange={(e) => updateEnvPair(i, 'value', e.target.value)}
                        placeholder={t('mcp.field.envValuePlaceholder')}
                        className="font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeEnvPair(i)}
                        aria-label={t('mcp.field.envRemoveAria')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── http / sse fields ── */}
          {isRemote && (
            <>
              <Field label={t('mcp.field.url')} required>
                <Input
                  value={form.url}
                  onChange={(e) => updateField('url', e.target.value)}
                  placeholder={t('mcp.field.urlPlaceholder')}
                  className="font-mono text-xs"
                  type="url"
                  inputMode="url"
                />
              </Field>

              <Separator />

              <Field label={t('mcp.field.auth')}>
                <Segmented<McpAuthType>
                  value={form.authType}
                  onChange={(v) => updateField('authType', v)}
                  options={MCP_AUTH_TYPES.map((a) => ({ value: a, label: authLabels[a] }))}
                />
              </Field>

              {form.authType === 'bearer' && (
                <Field label={t('mcp.field.token')} required>
                  <Input
                    value={form.token}
                    onChange={(e) => updateField('token', e.target.value)}
                    placeholder={secretPlaceholder(form.tokenSet, t('mcp.field.tokenPlaceholder'))}
                    className="font-mono text-xs"
                    type="password"
                    autoComplete="off"
                  />
                </Field>
              )}

              {form.authType === 'header' && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Field label={t('mcp.field.headerName')} required>
                      <Input
                        value={form.headerName}
                        onChange={(e) => updateField('headerName', e.target.value)}
                        placeholder={t('mcp.field.headerNamePlaceholder')}
                        className="font-mono text-xs"
                      />
                    </Field>
                  </div>
                  <div className="flex-1">
                    <Field label={t('mcp.field.headerValue')} required>
                      <Input
                        value={form.headerValue}
                        onChange={(e) => updateField('headerValue', e.target.value)}
                        placeholder={secretPlaceholder(
                          form.headerValueSet,
                          t('mcp.field.headerValuePlaceholder'),
                        )}
                        className="font-mono text-xs"
                        type="password"
                        autoComplete="off"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {form.authType === 'oauth2_client_credentials' && (
                <>
                  <Field label={t('mcp.field.tokenUrl')} required>
                    <Input
                      value={form.tokenUrl}
                      onChange={(e) => updateField('tokenUrl', e.target.value)}
                      placeholder={t('mcp.field.tokenUrlPlaceholder')}
                      className="font-mono text-xs"
                      type="url"
                    />
                  </Field>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Field label={t('mcp.field.clientId')} required>
                        <Input
                          value={form.clientId}
                          onChange={(e) => updateField('clientId', e.target.value)}
                          placeholder={t('mcp.field.clientIdPlaceholder')}
                          className="font-mono text-xs"
                          autoComplete="off"
                        />
                      </Field>
                    </div>
                    <div className="flex-1">
                      <Field label={t('mcp.field.clientSecret')} required>
                        <Input
                          value={form.clientSecret}
                          onChange={(e) => updateField('clientSecret', e.target.value)}
                          placeholder={secretPlaceholder(
                            form.clientSecretSet,
                            t('mcp.field.clientSecretPlaceholder'),
                          )}
                          className="font-mono text-xs"
                          type="password"
                          autoComplete="off"
                        />
                      </Field>
                    </div>
                  </div>
                  <Field label={t('mcp.field.scope')}>
                    <Input
                      value={form.scope}
                      onChange={(e) => updateField('scope', e.target.value)}
                      placeholder={t('mcp.field.scopePlaceholder')}
                      className="font-mono text-xs"
                    />
                  </Field>
                </>
              )}

              <p className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground">
                {t('mcp.field.oauthHint')}
              </p>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:action.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid(form)}>
            {t('mcp.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Server card
// ---------------------------------------------------------------------------

interface ServerCardProps {
  readonly server: McpServer
  readonly onEdit: () => void
  readonly onDelete: () => void
}

function ServerCard({ server, onEdit, onDelete }: ServerCardProps) {
  const { t } = useTranslation('admin')
  const [testState, setTestState] = useState<ConnectionTestState>('idle')

  function handleTest() {
    setTestState('testing')
    apiPost<{ ok: boolean }>(`/api/mcp-servers/${server.id}/test`, {})
      .then((r) => setTestState(r.ok ? 'success' : 'failure'))
      .catch(() => setTestState('failure'))
      .finally(() => setTimeout(() => setTestState('idle'), 3000))
  }

  const isRemote = isRemoteMcpTransport(server.type)
  const preview = isRemote
    ? (server.url ?? '')
    : [server.command, ...server.args].filter(Boolean).join(' ')
  const authType = server.auth?.type ?? 'none'
  const hasAuth = authType !== 'none'
  const authBadgeKey =
    authType === 'bearer'
      ? 'mcp.field.authBearer'
      : authType === 'header'
        ? 'mcp.field.authHeader'
        : 'mcp.field.authOauth2'

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-purple-500/10 text-purple-400">
          <Plug className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{server.name}</p>
            <Badge
              variant="outline"
              className="border-purple-500/30 text-purple-400 text-[10px] shrink-0"
            >
              {server.type}
            </Badge>
            {hasAuth && (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] shrink-0 gap-0.5"
              >
                <Lock className="h-2.5 w-2.5" />
                {t(authBadgeKey)}
              </Badge>
            )}
          </div>
          {server.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{server.description}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={onEdit}
            aria-label={t('mcp.card.editAria', { name: server.name })}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            aria-label={t('mcp.card.deleteAria', { name: server.name })}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Command / URL preview */}
      <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5">
        {isRemote ? (
          <Globe className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <Terminal className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
          {preview}
        </code>
      </div>

      {/* Test button + result — only remote servers can be probed over the network */}
      {isRemote && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={handleTest}
            disabled={testState === 'testing'}
          >
            {testState === 'testing' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ExternalLink className="h-3 w-3" />
            )}
            {testState === 'testing' ? t('mcp.card.testing') : t('mcp.card.test')}
          </Button>

          {testState === 'success' && (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t('mcp.card.connected')}
            </span>
          )}
          {testState === 'failure' && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <XCircle className="h-3.5 w-3.5" />
              {t('mcp.card.failed')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function McpManagement({
  open,
  onOpenChange,
  servers,
  onAdd,
  onEdit,
  onDelete,
}: McpManagementProps) {
  const { t } = useTranslation('admin')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<McpServer | null>(null)

  function handleAdd(server: McpServerInput) {
    onAdd(server)
  }

  function handleEdit(server: McpServerInput) {
    if (!editingServer) return
    onEdit(editingServer.id, server)
    setEditingServer(null)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex flex-col gap-0 p-0">
          <SheetHeader className="flex-row items-center gap-3 border-b px-6 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <Plug className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-base">{t('mcp.title')}</SheetTitle>
              <SheetDescription className="text-xs">{t('mcp.description')}</SheetDescription>
            </div>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-0 overflow-y-auto px-6 pb-6 pt-4">
            <Button
              variant="outline"
              size="sm"
              className="mb-4 self-start gap-2"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t('mcp.add')}
            </Button>

            <Separator className="mb-4" />

            {servers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Plug className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{t('mcp.empty.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('mcp.empty.description')}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3" role="list" aria-label={t('mcp.list.ariaLabel')}>
                {servers.map((server) => (
                  <div key={server.id} role="listitem">
                    <ServerCard
                      server={server}
                      onEdit={() => setEditingServer(server)}
                      onDelete={() => onDelete(server.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add dialog */}
      <ServerFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title={t('mcp.dialog.addTitle')}
        initialForm={blankForm()}
        onSubmit={handleAdd}
      />

      {/* Edit dialog */}
      <ServerFormDialog
        open={editingServer !== null}
        onOpenChange={(o) => {
          if (!o) setEditingServer(null)
        }}
        title={t('mcp.dialog.editTitle')}
        initialForm={editingServer ? serverToForm(editingServer) : blankForm()}
        onSubmit={handleEdit}
      />
    </>
  )
}
