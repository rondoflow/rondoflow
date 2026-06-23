'use client'

import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { Puzzle, ChevronDown, Check, Loader2 } from 'lucide-react'
import type { SkillNodeData } from '@/lib/canvas-utils'
import { apiGet } from '@/lib/api'
import type { Skill } from '@rondoflow/shared'
import { cn } from '@/lib/utils'
import { NodeShell, NodeField } from './node-shell'
import { NodeActions } from './node-actions'
import { useCanvasActions } from '../canvas-actions'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

const SKILL_ACCENT = '#3b82f6'

/** Turn a skill slug like "code-review" into a friendly label "Code Review". */
function humanizeSkillName(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function SkillNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as SkillNodeData
  const { selected } = props
  const { name, skillId, category } = data
  const { requestUpdateNodeData } = useCanvasActions()

  const [skills, setSkills] = useState<readonly Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const loadSkills = useCallback(async () => {
    setLoading(true)
    try {
      const list = await apiGet<Skill[]>('/api/skills')
      setSkills(list)
    } catch {
      setSkills([])
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }, [])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) void loadSkills()
    },
    [loadSkills],
  )

  // Assigning an installed skill renames the node and records the skill id so
  // the assignment persists with the canvas.
  const handleAssign = useCallback(
    (skill: Skill) => {
      requestUpdateNodeData(props.id, {
        skillId: skill.id,
        name: humanizeSkillName(skill.name),
        category: skill.category ?? undefined,
      })
    },
    [props.id, requestUpdateNodeData],
  )

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="skill" selected={selected} />

      <NodeShell
        accent={SKILL_ACCENT}
        width={220}
        selected={selected}
        output={{ label: t('node.skill.outputLabel') }}
        aria-label={t('node.skill.aria', { name })}
        icon={<Puzzle className="h-4 w-4" aria-hidden />}
        title={name}
        description={t('node.skill.description')}
      >
        <NodeField label={t('node.skill.fieldLabel')} port accent={SKILL_ACCENT}>
          <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                className={cn(
                  'nodrag flex w-full items-center justify-between gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
                  skillId
                    ? 'border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    : 'border-dashed border-border text-muted-foreground/80 hover:bg-muted hover:text-foreground',
                )}
                aria-label={t('node.skill.assignAria')}
              >
                <span className="truncate">
                  {skillId ? (category ?? t('node.skill.assignedSkill')) : t('node.skill.assignPlaceholder')}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 w-56 overflow-y-auto">
              <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('node.skill.installedSkills')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {loading ? (
                <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                  {t('node.skill.loading')}
                </div>
              ) : skills.length === 0 ? (
                <div className="px-2 py-2 text-xs leading-relaxed text-muted-foreground">
                  {loaded
                    ? t('node.skill.empty')
                    : t('node.skill.loadingShort')}
                </div>
              ) : (
                skills.map((s) => (
                  <DropdownMenuItem
                    key={s.id}
                    onSelect={() => handleAssign(s)}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="truncate">{humanizeSkillName(s.name)}</span>
                    {s.id === skillId && (
                      <Check className="h-3 w-3 shrink-0 text-primary" aria-hidden />
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </NodeField>
      </NodeShell>
    </>
  )
}

export const SkillNode = memo(SkillNodeComponent)
SkillNode.displayName = 'SkillNode'
