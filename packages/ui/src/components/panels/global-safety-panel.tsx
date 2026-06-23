'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export interface GlobalSafetyPanelProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

const DEFAULT_BLOCKED = ['rm -rf /', 'DROP TABLE', 'FORMAT']
const DEFAULT_APPROVAL = ['rm', 'git push', 'npm publish', 'docker rm']

export function GlobalSafetyPanel({ open, onOpenChange }: GlobalSafetyPanelProps) {
  const { t } = useTranslation('settings')
  const [blockedCommands, setBlockedCommands] = useState<string[]>(DEFAULT_BLOCKED)
  const [approvalCommands, setApprovalCommands] = useState<string[]>(DEFAULT_APPROVAL)
  const [newBlocked, setNewBlocked] = useState('')
  const [newApproval, setNewApproval] = useState('')
  const [safetyLevel, setSafetyLevel] = useState<'cautious' | 'balanced' | 'autonomous'>('balanced')

  const addBlocked = () => {
    const v = newBlocked.trim()
    if (v && !blockedCommands.includes(v)) {
      setBlockedCommands((prev) => [...prev, v])
      setNewBlocked('')
    }
  }

  const addApproval = () => {
    const v = newApproval.trim()
    if (v && !approvalCommands.includes(v)) {
      setApprovalCommands((prev) => [...prev, v])
      setNewApproval('')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('globalSafety.title')}
          </SheetTitle>
        </SheetHeader>

        <Separator className="my-3" />

        <div className="flex flex-col gap-6">
          {/* Safety Level */}
          <div>
            <h3 className="text-sm font-medium mb-2">{t('globalSafety.defaultLevel.title')}</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {t('globalSafety.defaultLevel.description')}
            </p>
            <div className="flex flex-col gap-2">
              {([
                { value: 'cautious' as const, label: t('globalSafety.defaultLevel.cautious.label'), desc: t('globalSafety.defaultLevel.cautious.description') },
                { value: 'balanced' as const, label: t('globalSafety.defaultLevel.balanced.label'), desc: t('globalSafety.defaultLevel.balanced.description') },
                { value: 'autonomous' as const, label: t('globalSafety.defaultLevel.autonomous.label'), desc: t('globalSafety.defaultLevel.autonomous.description') },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    safetyLevel === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => setSafetyLevel(opt.value)}
                >
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    safetyLevel === opt.value ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {safetyLevel === opt.value && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{opt.label}</span>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Blocked Commands */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">{t('globalSafety.blocked.title')}</h3>
              <Badge variant="destructive" className="text-[10px]">
                {blockedCommands.length}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {t('globalSafety.blocked.description')}
            </p>
            <div className="flex flex-col gap-1.5">
              {blockedCommands.map((cmd) => (
                <div key={cmd} className="flex items-center gap-2 rounded border border-destructive/30 bg-destructive/5 px-3 py-1.5">
                  <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                  <code className="flex-1 text-xs font-mono">{cmd}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setBlockedCommands((prev) => prev.filter((c) => c !== cmd))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <form className="flex gap-2 mt-1" onSubmit={(e) => { e.preventDefault(); addBlocked() }}>
                <Input
                  value={newBlocked}
                  onChange={(e) => setNewBlocked(e.target.value)}
                  placeholder={t('globalSafety.blocked.placeholder')}
                  className="h-8 text-xs font-mono"
                />
                <Button type="submit" size="sm" variant="outline" className="h-8 shrink-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </form>
            </div>
          </div>

          <Separator />

          {/* Approval Required */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">{t('globalSafety.approval.title')}</h3>
              <Badge variant="secondary" className="text-[10px]">
                {approvalCommands.length}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {t('globalSafety.approval.description')}
            </p>
            <div className="flex flex-col gap-1.5">
              {approvalCommands.map((cmd) => (
                <div key={cmd} className="flex items-center gap-2 rounded border px-3 py-1.5">
                  <Shield className="h-3 w-3 text-yellow-500 shrink-0" />
                  <code className="flex-1 text-xs font-mono">{cmd}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setApprovalCommands((prev) => prev.filter((c) => c !== cmd))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <form className="flex gap-2 mt-1" onSubmit={(e) => { e.preventDefault(); addApproval() }}>
                <Input
                  value={newApproval}
                  onChange={(e) => setNewApproval(e.target.value)}
                  placeholder={t('globalSafety.approval.placeholder')}
                  className="h-8 text-xs font-mono"
                />
                <Button type="submit" size="sm" variant="outline" className="h-8 shrink-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </form>
            </div>
          </div>

          <Separator />

          {/* Timeout */}
          <div>
            <h3 className="text-sm font-medium mb-2">{t('globalSafety.timeout.title')}</h3>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                defaultValue={300}
                min={30}
                max={3600}
                className="h-8 w-24 text-xs"
              />
              <span className="text-xs text-muted-foreground">{t('globalSafety.timeout.hint')}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
