'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { StepWorkingDirectory } from './step-working-directory'
import { StepWorkMode, type WorkMode } from './step-work-mode'
import { StepFirstAction, type FirstAction, type FirstActionPayload } from './step-first-action'
import { cn } from '@/lib/utils'

export interface OnboardingWizardProps {
  readonly open: boolean
  readonly onComplete: (result: OnboardingResult) => void
}

export interface OnboardingResult {
  readonly workingDirectory: string
  readonly workMode: WorkMode
  readonly firstAction: FirstAction
  readonly description?: string
  readonly templateId?: string
}

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const { t } = useTranslation('onboarding')
  const [step, setStep] = useState(1)
  const [workingDir, setWorkingDir] = useState('')
  const [workMode, setWorkMode] = useState<WorkMode | null>(null)

  function handleFirstAction(action: FirstAction, payload?: FirstActionPayload) {
    onComplete({
      workingDirectory: workingDir.trim(),
      workMode: workMode ?? 'quick',
      firstAction: action,
      description: payload?.description,
      templateId: payload?.templateId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className={cn(
          'border-border [&>button.absolute]:hidden',
          // Step 3 is a split-screen (control + canvas preview) and needs room;
          // the earlier steps stay narrow and centred.
          step === 3 ? 'max-h-[88vh] max-w-5xl overflow-y-auto p-6' : 'max-w-2xl p-8',
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          // Only allow Escape on step 2+ (step 1 is mandatory)
          if (step === 1) {
            e.preventDefault()
          } else if (step === 2) {
            // Skip to step 3 with default mode
            setStep(3)
          }
        }}
      >
        <DialogTitle className="sr-only">{t('wizard.title')}</DialogTitle>

        {/* Step indicator */}
        <div className="mb-4 flex items-center justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition-all ${
                n === step
                  ? 'w-6 bg-primary'
                  : n < step
                  ? 'w-3 bg-primary/60'
                  : 'w-3 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Steps */}
        {step === 1 && (
          <StepWorkingDirectory
            value={workingDir}
            onChange={setWorkingDir}
            onContinue={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepWorkMode
            value={workMode}
            onChange={setWorkMode}
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepFirstAction
            onAction={handleFirstAction}
            onBack={() => setStep(2)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
