'use client'

import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Loader2, Plus, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Shared create/edit form for user-authored skills. Create mode (Marketplace
// "Create" tab) authors a new SKILL.md; edit mode re-writes an existing custom
// or git skill. Built-in catalog skills are read-only and never reach here.
// ---------------------------------------------------------------------------

export interface SkillFormValues {
  readonly name: string
  readonly description: string
  readonly category: string
  readonly content: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export interface SkillFormProps {
  readonly mode: 'create' | 'edit'
  readonly initial?: Partial<SkillFormValues>
  /** Distinct catalog categories offered as autocomplete for the category field. */
  readonly categorySuggestions?: readonly string[]
  /** Resolves on success; rejects with an Error whose message is shown inline. */
  readonly onSubmit: (values: SkillFormValues) => Promise<void>
  /** Edit mode renders a header back button wired to this. */
  readonly onCancel?: () => void
}

export function SkillForm({ mode, initial, categorySuggestions, onSubmit, onCancel }: SkillFormProps) {
  const { t } = useTranslation('resources')
  const datalistId = useId()
  const isEdit = mode === 'edit'

  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const trimmedName = name.trim()
  // Name is immutable on edit, so its validity only gates creation.
  const nameValid = isEdit || trimmedName === '' || /^[a-zA-Z0-9_-]+$/.test(trimmedName)
  const canSubmit =
    (isEdit || (trimmedName !== '' && nameValid)) &&
    description.trim() !== '' &&
    content.trim() !== '' &&
    status !== 'loading'

  async function handleSubmit() {
    if (!canSubmit) return
    setStatus('loading')
    setMessage(null)
    try {
      const submittedName = isEdit ? (initial?.name ?? trimmedName) : trimmedName
      await onSubmit({
        name: submittedName,
        description: description.trim(),
        category: category.trim(),
        content,
      })
      setStatus('success')
      setMessage(
        isEdit
          ? t('marketplace.edit.success', { name: submittedName })
          : t('marketplace.create.success', { name: submittedName }),
      )
      if (!isEdit) {
        setName('')
        setDescription('')
        setCategory('')
        setContent('')
      }
    } catch (err) {
      setStatus('error')
      setMessage(
        err instanceof Error
          ? err.message
          : isEdit
            ? t('marketplace.edit.failed')
            : t('marketplace.create.failed'),
      )
    }
  }

  return (
    // Edit mode replaces the full-height detail view (own header + scroll body);
    // create mode lives inside the already-scrollable tab container, so it must
    // not claim `h-full` (that would collapse against the auto-height tab panel).
    <div className={cn('flex flex-col', isEdit && 'h-full')}>
      {/* Edit mode gets its own header with a back action (it replaces the detail
          view); create mode lives inside the tab layout and needs none. */}
      {isEdit && (
        <div className="flex items-center border-b px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            aria-label={t('marketplace.edit.backAria')}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('detail.back')}
          </Button>
        </div>
      )}

      <div className={cn('flex flex-col gap-3', isEdit ? 'flex-1 overflow-y-auto px-5 py-4' : 'py-4')}>
        {isEdit && initial?.name && (
          <h2 className="text-base font-semibold leading-tight">
            {t('marketplace.edit.title', { name: initial.name })}
          </h2>
        )}

        <p className="text-xs text-muted-foreground">
          {isEdit ? t('marketplace.edit.intro') : t('marketplace.create.intro')}
        </p>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="skill-form-name" className="text-xs font-medium text-muted-foreground">
            {t('marketplace.create.nameLabel')}
          </label>
          <Input
            id="skill-form-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('marketplace.create.namePlaceholder')}
            className="font-mono text-xs"
            aria-label={t('marketplace.create.nameAria')}
            disabled={isEdit}
            readOnly={isEdit}
          />
          {isEdit ? (
            <p className="text-[11px] text-muted-foreground/70">{t('marketplace.edit.nameReadonly')}</p>
          ) : (
            !nameValid && (
              <p className="text-[11px] text-destructive">{t('marketplace.create.nameInvalid')}</p>
            )
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="skill-form-description" className="text-xs font-medium text-muted-foreground">
            {t('marketplace.create.descriptionLabel')}
          </label>
          <Input
            id="skill-form-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('marketplace.create.descriptionPlaceholder')}
            className="text-xs"
            aria-label={t('marketplace.create.descriptionAria')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="skill-form-category" className="text-xs font-medium text-muted-foreground">
            {t('marketplace.create.categoryLabel')}{' '}
            <span className="text-muted-foreground/60">{t('marketplace.create.categoryOptional')}</span>
          </label>
          <Input
            id="skill-form-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t('marketplace.create.categoryPlaceholder')}
            className="text-xs"
            aria-label={t('marketplace.create.categoryAria')}
            list={categorySuggestions && categorySuggestions.length > 0 ? datalistId : undefined}
          />
          {categorySuggestions && categorySuggestions.length > 0 && (
            <datalist id={datalistId}>
              {categorySuggestions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="skill-form-content" className="text-xs font-medium text-muted-foreground">
            {t('marketplace.create.instructionsLabel')}
          </label>
          <Textarea
            id="skill-form-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('marketplace.create.instructionsPlaceholder')}
            className="min-h-[160px] font-mono text-xs leading-relaxed"
            aria-label={t('marketplace.create.instructionsAria')}
          />
        </div>

        <Button
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          size="sm"
          className="gap-1.5 self-start"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {isEdit ? t('marketplace.edit.saving') : t('marketplace.create.creating')}
            </>
          ) : (
            <>
              {isEdit ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {isEdit ? t('marketplace.edit.submit') : t('marketplace.create.submit')}
            </>
          )}
        </Button>

        {message && (
          <div
            className={cn(
              'flex items-start gap-2 rounded-md border px-3 py-2.5 text-xs',
              status === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-destructive/30 bg-destructive/10 text-destructive',
            )}
            role="status"
            aria-live="polite"
          >
            {status === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            )}
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
