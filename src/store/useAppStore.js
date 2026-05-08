import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Initial mock Git repository state for the terminal */
const INITIAL_REPO = {
  branch: 'main',
  branches: ['main', 'feature/auth', 'hotfix/login'],
  commits: [
    { h: 'a1b2c3d', msg: 'Initial commit',               time: '3 days ago' },
    { h: 'b2c3d4e', msg: 'Add user authentication',      time: '2 days ago' },
    { h: 'c3d4e5f', msg: 'Implement JWT refresh tokens', time: '1 day ago' },
    { h: 'd4e5f6g', msg: 'Fix session expiry bug',       time: '4 hours ago' },
  ],
  staged:   [],
  unstaged: ['src/api.js', 'tests/api.test.js'],
  untracked:['src/utils/crypto.js'],
  stash:    [],
  head:     'd4e5f6g',
  remotes:  ['origin'],
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Theme ──────────────────────────────────────────────
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        if (next === 'light') {
          document.documentElement.classList.add('light')
        } else {
          document.documentElement.classList.remove('light')
        }
      },

      // ── Sidebar ────────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

      // ── Terminal ───────────────────────────────────────────
      repoState: { ...INITIAL_REPO },
      terminalHistory: [],
      appendTerminalLine: (entry) => set(s => ({
        terminalHistory: [...s.terminalHistory, entry],
      })),
      clearTerminal: () => set({ terminalHistory: [] }),
      resetRepo: () => set({ repoState: { ...INITIAL_REPO }, terminalHistory: [] }),
      updateRepo: (patch) => set(s => ({
        repoState: { ...s.repoState, ...patch },
      })),

      // ── Playground Tab ─────────────────────────────────────
      playgroundTab: 'terminal',
      setPlaygroundTab: (tab) => set({ playgroundTab: tab }),

      // ── Visualizer Steps ───────────────────────────────────
      vizSteps: {},
      setVizStep: (key, step) => set(s => ({
        vizSteps: { ...s.vizSteps, [key]: step },
      })),
      getVizStep: (key) => get().vizSteps[key] ?? 0,

      // ── Rebase Simulator ───────────────────────────────────
      rebaseStep: 0,
      setRebaseStep: (step) => set({ rebaseStep: step }),

      // ── Reset Simulator ────────────────────────────────────
      resetMode: '--soft',
      setResetMode: (mode) => set({ resetMode: mode }),

      // ── Search ─────────────────────────────────────────────
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      // ── Expanded Sections ──────────────────────────────────
      expandedSections: {},
      toggleSection: (id) => set(s => ({
        expandedSections: {
          ...s.expandedSections,
          [id]: !s.expandedSections[id],
        },
      })),

      // ── Active Tabs (per-page) ─────────────────────────────
      activeTabs: {},
      setActiveTab: (pageKey, tabId) => set(s => ({
        activeTabs: { ...s.activeTabs, [pageKey]: tabId },
      })),
      getActiveTab: (pageKey, defaultTab) => get().activeTabs[pageKey] ?? defaultTab,
    }),
    {
      name: 'gitverse-storage',
      partialize: (state) => ({
        theme:      state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
