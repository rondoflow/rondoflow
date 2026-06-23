'use client'

import { createContext, useContext } from 'react'

/**
 * True when the canvas is read-only (the user's role lacks edit rights). Provided
 * high in the page so the palette, ReactFlow editability, and node interactions
 * can all consult one source instead of each calling useRole(). The server is the
 * real authority — this only governs which affordances the UI exposes.
 */
const CanvasReadOnlyContext = createContext<boolean>(false)

export const CanvasReadOnlyProvider = CanvasReadOnlyContext.Provider

export function useCanvasReadOnly(): boolean {
  return useContext(CanvasReadOnlyContext)
}
