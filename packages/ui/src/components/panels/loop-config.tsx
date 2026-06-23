'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { LoopCriteria } from '@rondoflow/shared'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoopConfigValue {
  readonly loopEnabled: boolean
  readonly loopCriteria: LoopCriteria | null
  readonly maxIterations: number
}

export interface LoopConfigProps {
  readonly value: LoopConfigValue
  readonly onChange: (updated: LoopConfigValue) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CRITERIA_OPTIONS: readonly {
  value: LoopCriteria['type']
  labelKey: string
  placeholderKey: string | null
  showInput: boolean
}[] = [
  {
    value: 'regex',
    labelKey: 'loop.criteria.regex',
    placeholderKey: 'loop.criteriaPlaceholder.regex',
    showInput: true,
  },
  {
    value: 'test_pass',
    labelKey: 'loop.criteria.testPass',
    placeholderKey: 'loop.criteriaPlaceholder.testPass',
    showInput: true,
  },
  {
    value: 'manual',
    labelKey: 'loop.criteria.manual',
    placeholderKey: null,
    showInput: false,
  },
  {
    value: 'max_iterations',
    labelKey: 'loop.criteria.maxIterations',
    placeholderKey: null,
    showInput: false,
  },
]

const MIN_ITERATIONS = 1
const MAX_ITERATIONS = 100
const DEFAULT_ITERATIONS = 10

// ---------------------------------------------------------------------------
// Toggle switch
// ---------------------------------------------------------------------------

interface ToggleSwitchProps {
  readonly checked: boolean
  readonly onToggle: () => void
  readonly label: string
}

function ToggleSwitch({ checked, onToggle, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        'relative h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
        checked ? 'bg-primary' : 'bg-muted',
      )}
    >
      <span
        className={cn(
          'block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Slider
// ---------------------------------------------------------------------------

interface SliderProps {
  readonly value: number
  readonly min: number
  readonly max: number
  readonly onChange: (value: number) => void
  readonly ariaLabel: string
}

function Slider({ value, min, max, onChange, ariaLabel }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted"
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%)`,
        }}
      />
      <span
        className="w-8 shrink-0 text-right text-sm font-medium tabular-nums"
        aria-live="polite"
        aria-atomic
      >
        {value}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function LoopConfig({ value, onChange }: LoopConfigProps) {
  const { t } = useTranslation('scheduling')
  const { loopEnabled, loopCriteria, maxIterations } = value

  const [criteriaType, setCriteriaType] = useState<LoopCriteria['type']>(
    loopCriteria?.type ?? 'max_iterations',
  )
  const [criteriaValue, setCriteriaValue] = useState(loopCriteria?.value ?? '')

  function emitChange(partial: Partial<LoopConfigValue>) {
    onChange({ ...value, ...partial })
  }

  function handleToggle() {
    const next = !loopEnabled
    emitChange({
      loopEnabled: next,
      loopCriteria: next
        ? { type: criteriaType, value: criteriaValue }
        : null,
      maxIterations: maxIterations || DEFAULT_ITERATIONS,
    })
  }

  function handleCriteriaTypeChange(type: LoopCriteria['type']) {
    setCriteriaType(type)
    const newCriteria: LoopCriteria = { type, value: criteriaValue }
    emitChange({ loopCriteria: newCriteria })
  }

  function handleCriteriaValueChange(val: string) {
    setCriteriaValue(val)
    if (loopEnabled) {
      emitChange({ loopCriteria: { type: criteriaType, value: val } })
    }
  }

  function handleMaxIterationsChange(iters: number) {
    const clamped = Math.min(MAX_ITERATIONS, Math.max(MIN_ITERATIONS, iters))
    emitChange({ maxIterations: clamped })
  }

  const selectedCriteriaOption = CRITERIA_OPTIONS.find((o) => o.value === criteriaType)

  return (
    <div className="flex flex-col gap-4">
      <Separator />

      {/* Autonomous loop toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium">{t('loop.title')}</p>
          <p className="text-xs text-muted-foreground">
            {t('loop.description')}
          </p>
        </div>
        <ToggleSwitch
          checked={loopEnabled}
          onToggle={handleToggle}
          label={loopEnabled ? t('loop.toggle.disable') : t('loop.toggle.enable')}
        />
      </div>

      {/* Expanded config when enabled */}
      {loopEnabled && (
        <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-3">
          {/* Completion criteria */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="loop-criteria-type"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              {t('loop.completionCriteria')}
            </label>
            <div className="relative">
              <select
                id="loop-criteria-type"
                value={criteriaType}
                onChange={(e) => handleCriteriaTypeChange(e.target.value as LoopCriteria['type'])}
                className={cn(
                  'w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8',
                  'text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                )}
              >
                {CRITERIA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Criteria value input */}
          {selectedCriteriaOption?.showInput && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="loop-criteria-value"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                {criteriaType === 'regex' ? t('loop.field.pattern') : t('loop.field.command')}
              </label>
              <Input
                id="loop-criteria-value"
                value={criteriaValue}
                onChange={(e) => handleCriteriaValueChange(e.target.value)}
                placeholder={selectedCriteriaOption.placeholderKey ? t(selectedCriteriaOption.placeholderKey) : ''}
                className="font-mono text-xs"
              />
            </div>
          )}

          {/* Max iterations slider */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('loop.maxIterations')}
            </label>
            <Slider
              value={maxIterations || DEFAULT_ITERATIONS}
              min={MIN_ITERATIONS}
              max={MAX_ITERATIONS}
              onChange={handleMaxIterationsChange}
              ariaLabel={t('loop.maxIterationsAriaLabel')}
            />
            <p className="text-[11px] text-muted-foreground">
              {t('loop.iterationCap', { count: maxIterations || DEFAULT_ITERATIONS })}
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
            <p className="text-xs text-amber-400">
              {t('loop.warning')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
