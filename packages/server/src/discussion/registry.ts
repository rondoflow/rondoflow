// Shared registry of running ModeratorEngine instances, keyed by discussion
// tableId. Both the Socket.IO handlers (the primary control surface used by the
// UI) and the HTTP routes import THIS map so start/pause/resume and lifecycle
// cleanup all operate on the same engine instances regardless of transport.

import type { ModeratorEngine } from './moderator'

export const activeDiscussionEngines = new Map<string, ModeratorEngine>()
