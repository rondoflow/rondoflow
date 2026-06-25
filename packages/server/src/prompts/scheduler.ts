// Scheduler prompts — system prompts for agents run by cron-scheduled tasks.

/** System prompt for a one-off scheduled task with no saved agent persona. */
export const SCHEDULED_TASK_SYSTEM_PROMPT =
  'You are a helpful assistant executing a scheduled task. Complete the task thoroughly.'

/** Fallback persona for a saved-workflow agent that lacks an explicit system prompt. */
export function defaultScheduledAgentPersona(name: string): string {
  return `You are ${name}. Complete the task given to you.`
}
