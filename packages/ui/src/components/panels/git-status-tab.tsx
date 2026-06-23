'use client'

import { useTranslation } from 'react-i18next'
import { Plus, Minus, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GitFileEntry } from '@rondoflow/shared'

interface GitStatusTabProps {
  readonly files: readonly GitFileEntry[]
  readonly onStage: (paths: string[]) => void
  readonly onUnstage: (paths: string[]) => void
}

const STATUS_COLOR: Record<GitFileEntry['status'], string> = {
  added: 'text-green-400',
  modified: 'text-yellow-400',
  deleted: 'text-red-400',
  renamed: 'text-blue-400',
  untracked: 'text-muted-foreground',
}

const STATUS_LABEL: Record<GitFileEntry['status'], string> = {
  added: 'A',
  modified: 'M',
  deleted: 'D',
  renamed: 'R',
  untracked: '?',
}

export function GitStatusTab({ files, onStage, onUnstage }: GitStatusTabProps) {
  const { t } = useTranslation('git')
  const staged = files.filter((f) => f.staged)
  const unstaged = files.filter((f) => !f.staged)

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Circle className="h-8 w-8 text-green-500/50" />
        <p className="text-sm text-muted-foreground">{t('status.empty')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Staged changes */}
      {staged.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-green-400">
              {t('status.staged', { count: staged.length })}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] text-muted-foreground"
              onClick={() => onUnstage(staged.map((f) => f.path))}
            >
              {t('status.unstageAll')}
            </Button>
          </div>
          <ul className="flex flex-col gap-0.5 rounded-md border border-green-500/20 bg-green-500/5 p-1">
            {staged.map((file) => (
              <FileRow
                key={`staged-${file.path}`}
                file={file}
                action="unstage"
                onAction={() => onUnstage([file.path])}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Unstaged changes */}
      {unstaged.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('status.changes', { count: unstaged.length })}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] text-muted-foreground"
              onClick={() => onStage(unstaged.map((f) => f.path))}
            >
              {t('status.stageAll')}
            </Button>
          </div>
          <ul className="flex flex-col gap-0.5">
            {unstaged.map((file) => (
              <FileRow
                key={`unstaged-${file.path}`}
                file={file}
                action="stage"
                onAction={() => onStage([file.path])}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function FileRow({
  file,
  action,
  onAction,
}: {
  readonly file: GitFileEntry
  readonly action: 'stage' | 'unstage'
  readonly onAction: () => void
}) {
  const { t } = useTranslation('git')
  return (
    <li className="flex items-center gap-2 rounded px-2 py-1 hover:bg-muted/50">
      <span
        className={cn('w-4 text-center font-mono text-[10px] font-bold', STATUS_COLOR[file.status])}
        title={t(`status.fileStatus.${file.status}`)}
      >
        {STATUS_LABEL[file.status]}
      </span>
      <span className="flex-1 truncate font-mono text-xs">{file.path}</span>
      <Button
        size="sm"
        variant="ghost"
        className="h-5 w-5 p-0"
        onClick={onAction}
        aria-label={action === 'stage' ? t('status.stageFile', { path: file.path }) : t('status.unstageFile', { path: file.path })}
        title={action === 'stage' ? t('status.stage') : t('status.unstage')}
      >
        {action === 'stage' ? (
          <Plus className="h-3 w-3 text-green-400" aria-hidden />
        ) : (
          <Minus className="h-3 w-3 text-yellow-400" aria-hidden />
        )}
      </Button>
    </li>
  )
}
