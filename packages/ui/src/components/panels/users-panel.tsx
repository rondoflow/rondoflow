'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, UserPlus, Ban, RotateCcw, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@/lib/roles'

interface AdminUser {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly image: string | null
  readonly role: UserRole
  readonly banned: boolean
  readonly createdAt: string
}

export interface UsersPanelProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

const ROLES: readonly UserRole[] = ['admin', 'editor', 'viewer']

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

export function UsersPanel({ open, onOpenChange }: UsersPanelProps) {
  const { t } = useTranslation('admin')
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<readonly AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)

  // Invite form
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('viewer')
  const [inviting, setInviting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ users: AdminUser[]; total: number }>('/api/users')
      setUsers(data.users)
    } catch (err) {
      toast({ description: errorMessage(err, t('users.toast.requestFailed')), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (open) void load()
  }, [open, load])

  const changeRole = useCallback(
    async (target: AdminUser, role: UserRole) => {
      if (role === target.role) return
      setBusyId(target.id)
      try {
        await apiPatch(`/api/users/${target.id}/role`, { role })
        setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, role } : u)))
        toast({
          description: t('users.role.changed', {
            email: target.email,
            role: t(`users.role.${role}.label`),
          }),
          variant: 'success',
        })
      } catch (err) {
        toast({ description: errorMessage(err, t('users.toast.requestFailed')), variant: 'error' })
      } finally {
        setBusyId(null)
      }
    },
    [t],
  )

  const toggleActive = useCallback(
    async (target: AdminUser) => {
      setBusyId(target.id)
      const action = target.banned ? 'reactivate' : 'deactivate'
      try {
        await apiPost(`/api/users/${target.id}/${action}`, {})
        setUsers((prev) =>
          prev.map((u) => (u.id === target.id ? { ...u, banned: !target.banned } : u)),
        )
        toast({
          description: target.banned
            ? t('users.toast.reactivated', { email: target.email })
            : t('users.toast.deactivated', { email: target.email }),
          variant: 'success',
        })
      } catch (err) {
        toast({ description: errorMessage(err, t('users.toast.requestFailed')), variant: 'error' })
      } finally {
        setBusyId(null)
      }
    },
    [t],
  )

  const removeUser = useCallback(async (target: AdminUser) => {
    setBusyId(target.id)
    try {
      await apiDelete(`/api/users/${target.id}`)
      setUsers((prev) => prev.filter((u) => u.id !== target.id))
      toast({ description: t('users.toast.deleted', { email: target.email }), variant: 'success' })
    } catch (err) {
      toast({ description: errorMessage(err, t('users.toast.requestFailed')), variant: 'error' })
    } finally {
      setBusyId(null)
      setConfirmDelete(null)
    }
  }, [t])

  const invite = useCallback(async () => {
    if (!email || !name || password.length < 8) {
      toast({ description: t('users.invite.validation'), variant: 'error' })
      return
    }
    setInviting(true)
    try {
      await apiPost('/api/users', { email, name, password, role: inviteRole })
      toast({ description: t('users.invite.created', { email }), variant: 'success' })
      setEmail('')
      setName('')
      setPassword('')
      setInviteRole('viewer')
      await load()
    } catch (err) {
      toast({ description: errorMessage(err, t('users.toast.requestFailed')), variant: 'error' })
    } finally {
      setInviting(false)
    }
  }, [email, name, password, inviteRole, load, t])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t('users.title')}</SheetTitle>
          <SheetDescription>
            {t('users.description')}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {/* Invite */}
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('users.invite.heading')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder={t('users.invite.placeholder.name')} value={name} onChange={(e) => setName(e.target.value)} />
              <Input type="email" placeholder={t('users.invite.placeholder.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="password"
                placeholder={t('users.invite.placeholder.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <RoleSelect value={inviteRole} onChange={setInviteRole} />
            </div>
            <Button onClick={() => void invite()} disabled={inviting} className="self-start">
              {inviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {t('users.invite.submit')}
            </Button>
          </div>

          <Separator className="my-4" />

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id
                return (
                  <li
                    key={u.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-border p-3',
                      u.banned && 'opacity-60',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{u.name}</span>
                        {isSelf && <Badge variant="outline" className="text-[10px]">{t('users.badge.you')}</Badge>}
                        {u.banned && <Badge variant="destructive" className="text-[10px]">{t('users.badge.deactivated')}</Badge>}
                      </div>
                      <span className="truncate text-xs text-muted-foreground">{u.email}</span>
                    </div>

                    <RoleSelect
                      value={u.role}
                      onChange={(role) => void changeRole(u, role)}
                      disabled={isSelf || busyId === u.id}
                      title={isSelf ? t('users.role.selfTitle') : undefined}
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      title={u.banned ? t('users.action.reactivate') : t('users.action.deactivate')}
                      disabled={isSelf || busyId === u.id}
                      onClick={() => void toggleActive(u)}
                    >
                      {u.banned ? <RotateCcw className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={t('users.action.deleteUser')}
                      disabled={isSelf || busyId === u.id}
                      onClick={() => setConfirmDelete(u)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                )
              })}
              {users.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">{t('users.empty')}</li>
              )}
            </ul>
          )}
        </div>
      </SheetContent>

      <AlertDialog open={confirmDelete !== null} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete
                ? t('users.delete.description', { email: confirmDelete.email })
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:action.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && void removeUser(confirmDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common:action.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}

function RoleSelect({
  value,
  onChange,
  disabled,
  title,
}: {
  readonly value: UserRole
  readonly onChange: (role: UserRole) => void
  readonly disabled?: boolean
  readonly title?: string
}) {
  const { t } = useTranslation('admin')
  return (
    <select
      value={value}
      title={title}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as UserRole)}
      className={cn(
        'h-9 rounded-md border border-input bg-background px-2 text-sm capitalize',
        'focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      )}
    >
      {ROLES.map((r) => (
        <option key={r} value={r} title={t(`users.role.${r}.description`)}>
          {t(`users.role.${r}.label`)}
        </option>
      ))}
    </select>
  )
}
