// Static locale resources. All namespaces for all locales are imported eagerly
// and bundled — switching language is then instant and synchronous (no async
// backend, no Suspense). `en` is the typing source of truth (see react-i18next.d.ts).

import enCommon from './locales/en/common.json'
import enShell from './locales/en/shell.json'
import enCanvas from './locales/en/canvas.json'
import enAuth from './locales/en/auth.json'
import enSettings from './locales/en/settings.json'
import enOnboarding from './locales/en/onboarding.json'
import enNotifications from './locales/en/notifications.json'
import enAgentDrawer from './locales/en/agentDrawer.json'
import enDiscussions from './locales/en/discussions.json'
import enAnalytics from './locales/en/analytics.json'
import enResources from './locales/en/resources.json'
import enScheduling from './locales/en/scheduling.json'
import enGit from './locales/en/git.json'
import enAdmin from './locales/en/admin.json'
import enPanelsMisc from './locales/en/panelsMisc.json'
import enApp from './locales/en/app.json'

import skCommon from './locales/sk/common.json'
import skShell from './locales/sk/shell.json'
import skCanvas from './locales/sk/canvas.json'
import skAuth from './locales/sk/auth.json'
import skSettings from './locales/sk/settings.json'
import skOnboarding from './locales/sk/onboarding.json'
import skNotifications from './locales/sk/notifications.json'
import skAgentDrawer from './locales/sk/agentDrawer.json'
import skDiscussions from './locales/sk/discussions.json'
import skAnalytics from './locales/sk/analytics.json'
import skResources from './locales/sk/resources.json'
import skScheduling from './locales/sk/scheduling.json'
import skGit from './locales/sk/git.json'
import skAdmin from './locales/sk/admin.json'
import skPanelsMisc from './locales/sk/panelsMisc.json'
import skApp from './locales/sk/app.json'

import esCommon from './locales/es/common.json'
import esShell from './locales/es/shell.json'
import esCanvas from './locales/es/canvas.json'
import esAuth from './locales/es/auth.json'
import esSettings from './locales/es/settings.json'
import esOnboarding from './locales/es/onboarding.json'
import esNotifications from './locales/es/notifications.json'
import esAgentDrawer from './locales/es/agentDrawer.json'
import esDiscussions from './locales/es/discussions.json'
import esAnalytics from './locales/es/analytics.json'
import esResources from './locales/es/resources.json'
import esScheduling from './locales/es/scheduling.json'
import esGit from './locales/es/git.json'
import esAdmin from './locales/es/admin.json'
import esPanelsMisc from './locales/es/panelsMisc.json'
import esApp from './locales/es/app.json'

import frCommon from './locales/fr/common.json'
import frShell from './locales/fr/shell.json'
import frCanvas from './locales/fr/canvas.json'
import frAuth from './locales/fr/auth.json'
import frSettings from './locales/fr/settings.json'
import frOnboarding from './locales/fr/onboarding.json'
import frNotifications from './locales/fr/notifications.json'
import frAgentDrawer from './locales/fr/agentDrawer.json'
import frDiscussions from './locales/fr/discussions.json'
import frAnalytics from './locales/fr/analytics.json'
import frResources from './locales/fr/resources.json'
import frScheduling from './locales/fr/scheduling.json'
import frGit from './locales/fr/git.json'
import frAdmin from './locales/fr/admin.json'
import frPanelsMisc from './locales/fr/panelsMisc.json'
import frApp from './locales/fr/app.json'

import deCommon from './locales/de/common.json'
import deShell from './locales/de/shell.json'
import deCanvas from './locales/de/canvas.json'
import deAuth from './locales/de/auth.json'
import deSettings from './locales/de/settings.json'
import deOnboarding from './locales/de/onboarding.json'
import deNotifications from './locales/de/notifications.json'
import deAgentDrawer from './locales/de/agentDrawer.json'
import deDiscussions from './locales/de/discussions.json'
import deAnalytics from './locales/de/analytics.json'
import deResources from './locales/de/resources.json'
import deScheduling from './locales/de/scheduling.json'
import deGit from './locales/de/git.json'
import deAdmin from './locales/de/admin.json'
import dePanelsMisc from './locales/de/panelsMisc.json'
import deApp from './locales/de/app.json'

export const resources = {
  en: {
    common: enCommon,
    shell: enShell,
    canvas: enCanvas,
    auth: enAuth,
    settings: enSettings,
    onboarding: enOnboarding,
    notifications: enNotifications,
    agentDrawer: enAgentDrawer,
    discussions: enDiscussions,
    analytics: enAnalytics,
    resources: enResources,
    scheduling: enScheduling,
    git: enGit,
    admin: enAdmin,
    panelsMisc: enPanelsMisc,
    app: enApp,
  },
  sk: {
    common: skCommon,
    shell: skShell,
    canvas: skCanvas,
    auth: skAuth,
    settings: skSettings,
    onboarding: skOnboarding,
    notifications: skNotifications,
    agentDrawer: skAgentDrawer,
    discussions: skDiscussions,
    analytics: skAnalytics,
    resources: skResources,
    scheduling: skScheduling,
    git: skGit,
    admin: skAdmin,
    panelsMisc: skPanelsMisc,
    app: skApp,
  },
  es: {
    common: esCommon,
    shell: esShell,
    canvas: esCanvas,
    auth: esAuth,
    settings: esSettings,
    onboarding: esOnboarding,
    notifications: esNotifications,
    agentDrawer: esAgentDrawer,
    discussions: esDiscussions,
    analytics: esAnalytics,
    resources: esResources,
    scheduling: esScheduling,
    git: esGit,
    admin: esAdmin,
    panelsMisc: esPanelsMisc,
    app: esApp,
  },
  fr: {
    common: frCommon,
    shell: frShell,
    canvas: frCanvas,
    auth: frAuth,
    settings: frSettings,
    onboarding: frOnboarding,
    notifications: frNotifications,
    agentDrawer: frAgentDrawer,
    discussions: frDiscussions,
    analytics: frAnalytics,
    resources: frResources,
    scheduling: frScheduling,
    git: frGit,
    admin: frAdmin,
    panelsMisc: frPanelsMisc,
    app: frApp,
  },
  de: {
    common: deCommon,
    shell: deShell,
    canvas: deCanvas,
    auth: deAuth,
    settings: deSettings,
    onboarding: deOnboarding,
    notifications: deNotifications,
    agentDrawer: deAgentDrawer,
    discussions: deDiscussions,
    analytics: deAnalytics,
    resources: deResources,
    scheduling: deScheduling,
    git: deGit,
    admin: deAdmin,
    panelsMisc: dePanelsMisc,
    app: deApp,
  },
} as const

// The `en` namespace map is the source of truth for translation-key typing.
export type Resources = (typeof resources)['en']
