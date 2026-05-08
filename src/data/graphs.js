/**
 * Commit graph scenarios for visualizations
 * Each scenario defines nodes (commits) + edges (parent connections)
 */

export const BRANCH_COLORS = {
  main:           '#6366f1',
  master:         '#6366f1',
  'feature/auth': '#22d3ee',
  'feature/ui':   '#a855f7',
  'hotfix/login': '#f59e0b',
  'release/v2':   '#10b981',
  develop:        '#10b981',
  HEAD:           '#ffffff',
}

export function getBranchColor(branch) {
  if (BRANCH_COLORS[branch]) return BRANCH_COLORS[branch]
  // Hash branch name to a consistent color from a palette
  const palette = ['#22d3ee', '#a855f7', '#f59e0b', '#f43f5e', '#10b981']
  let hash = 0
  for (let i = 0; i < branch.length; i++) hash = branch.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

/** Layout algorithm: assigns x/y positions to nodes */
export function layoutGraph(nodes, edges) {
  // Build parent-child maps
  const childrenOf = {}
  const parentsOf = {}
  nodes.forEach(n => { childrenOf[n.id] = []; parentsOf[n.id] = [] })
  edges.forEach(e => {
    if (childrenOf[e.from]) childrenOf[e.from].push(e.to)
    if (parentsOf[e.to])    parentsOf[e.to].push(e.from)
  })

  // Topological sort (Kahn's algorithm)
  const inDegree = {}
  nodes.forEach(n => inDegree[n.id] = parentsOf[n.id].length)
  const queue = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id)
  const sorted = []
  while (queue.length > 0) {
    const id = queue.shift()
    sorted.push(id)
    childrenOf[id].forEach(child => {
      inDegree[child]--
      if (inDegree[child] === 0) queue.push(child)
    })
  }

  // Assign X position by topological order
  const xMap = {}
  sorted.forEach((id, i) => { xMap[id] = i })

  // Assign Y (lane) by branch
  const branchLanes = {}
  let nextLane = 0
  const laneOrder = ['main', 'master', 'develop', 'release/v2']

  laneOrder.forEach(b => {
    branchLanes[b] = nextLane++
  })

  nodes.forEach(n => {
    if (branchLanes[n.branch] === undefined) {
      branchLanes[n.branch] = nextLane++
    }
  })

  const STEP_X = 90
  const STEP_Y = 60
  const PAD_X  = 50
  const PAD_Y  = 45

  return nodes.map(n => ({
    ...n,
    x: (xMap[n.id] || 0) * STEP_X + PAD_X,
    y: (branchLanes[n.branch] || 0) * STEP_Y + PAD_Y,
  }))
}

// ──────────────────────────────────────────────────────────
// GRAPH SCENARIOS
// ──────────────────────────────────────────────────────────

export const GRAPHS = {

  /** Standard feature branch workflow */
  feature_branch: {
    description: 'Feature branch: develop in isolation, merge back to main',
    nodes: [
      { id: 'a1', branch: 'main',           message: 'Initial commit',         sha: 'a1b2c3d' },
      { id: 'b2', branch: 'main',           message: 'Add user model',          sha: 'b2c3d4e' },
      { id: 'c3', branch: 'feature/auth',   message: 'Start auth feature',      sha: 'c3d4e5f' },
      { id: 'd4', branch: 'main',           message: 'Fix typo in readme',       sha: 'd4e5f6g' },
      { id: 'e5', branch: 'feature/auth',   message: 'Add JWT implementation',  sha: 'e5f6g7h' },
      { id: 'f6', branch: 'feature/auth',   message: 'Add refresh tokens',       sha: 'f6g7h8i' },
      { id: 'g7', branch: 'main',           message: 'Merge: feature/auth',      sha: 'g7h8i9j', merge: true },
    ],
    edges: [
      { from: 'a1', to: 'b2' },
      { from: 'b2', to: 'c3' },
      { from: 'b2', to: 'd4' },
      { from: 'c3', to: 'e5' },
      { from: 'd4', to: 'g7' },
      { from: 'e5', to: 'f6' },
      { from: 'f6', to: 'g7' },
    ],
    head: 'g7',
    branches: { main: 'g7', 'feature/auth': 'f6' },
  },

  /** Before rebase: feature diverged from main */
  rebase_before: {
    description: 'Before rebase: feature branch based off old main commit',
    nodes: [
      { id: 'a1', branch: 'main',           message: 'A: Setup',         sha: 'a1b2c3d' },
      { id: 'b2', branch: 'main',           message: 'B: Add API',       sha: 'b2c3d4e' },
      { id: 'c3', branch: 'main',           message: 'C: Add models',    sha: 'c3d4e5f' },
      { id: 'd4', branch: 'feature/auth',   message: 'D: Auth module',   sha: 'd4e5f6g' },
      { id: 'e5', branch: 'feature/auth',   message: 'E: Add JWT',       sha: 'e5f6g7h' },
    ],
    edges: [
      { from: 'a1', to: 'b2' },
      { from: 'b2', to: 'c3' },
      { from: 'b2', to: 'd4' },
      { from: 'd4', to: 'e5' },
    ],
    head: 'e5',
    branches: { main: 'c3', 'feature/auth': 'e5' },
  },

  /** After rebase: linear history */
  rebase_after: {
    description: "After rebase: feature commits replayed on top of main — new SHAs",
    nodes: [
      { id: 'a1',   branch: 'main',         message: 'A: Setup',            sha: 'a1b2c3d' },
      { id: 'b2',   branch: 'main',         message: 'B: Add API',          sha: 'b2c3d4e' },
      { id: 'c3',   branch: 'main',         message: 'C: Add models',       sha: 'c3d4e5f' },
      { id: "d4'",  branch: 'feature/auth', message: "D': Auth (new SHA)",  sha: "d4'e5f6", rebased: true },
      { id: "e5'",  branch: 'feature/auth', message: "E': JWT (new SHA)",   sha: "e5'f6g7", rebased: true },
    ],
    edges: [
      { from: 'a1', to: 'b2' },
      { from: 'b2', to: 'c3' },
      { from: 'c3', to: "d4'" },
      { from: "d4'", to: "e5'" },
    ],
    head: "e5'",
    branches: { main: 'c3', 'feature/auth': "e5'" },
  },

  /** Reset demonstration: HEAD movement */
  reset_demo: {
    description: 'Three commits on main — reset moves HEAD back',
    nodes: [
      { id: 'a1', branch: 'main', message: 'Initial commit',       sha: 'a1b2c3d' },
      { id: 'b2', branch: 'main', message: 'Add feature',          sha: 'b2c3d4e' },
      { id: 'c3', branch: 'main', message: 'WIP: broken code',     sha: 'c3d4e5f', head_before: true },
    ],
    edges: [
      { from: 'a1', to: 'b2' },
      { from: 'b2', to: 'c3' },
    ],
    head: 'c3',
    branches: { main: 'c3' },
  },

  /** GitFlow branching model */
  gitflow: {
    description: 'GitFlow: main, develop, feature branches, release, hotfix',
    nodes: [
      { id: 'm1', branch: 'main',        message: 'v1.0.0 release',     sha: 'm1', tag: 'v1.0.0' },
      { id: 'd1', branch: 'develop',     message: 'Start develop',       sha: 'd1' },
      { id: 'f1', branch: 'feature/ui',  message: 'Start UI feature',    sha: 'f1' },
      { id: 'f2', branch: 'feature/ui',  message: 'Add dark mode',       sha: 'f2' },
      { id: 'd2', branch: 'develop',     message: 'Merge: feature/ui',   sha: 'd2', merge: true },
      { id: 'r1', branch: 'release/v2',  message: 'Start release v2',    sha: 'r1' },
      { id: 'r2', branch: 'release/v2',  message: 'Fix pre-release bug', sha: 'r2' },
      { id: 'm2', branch: 'main',        message: 'v2.0.0 release',      sha: 'm2', tag: 'v2.0.0', merge: true },
      { id: 'h1', branch: 'hotfix/login',message: 'Hotfix login crash',  sha: 'h1' },
      { id: 'm3', branch: 'main',        message: 'v2.0.1 hotfix',       sha: 'm3', tag: 'v2.0.1', merge: true },
    ],
    edges: [
      { from: 'm1', to: 'd1' },
      { from: 'd1', to: 'f1' },
      { from: 'f1', to: 'f2' },
      { from: 'f2', to: 'd2' },
      { from: 'd1', to: 'd2' },
      { from: 'd2', to: 'r1' },
      { from: 'r1', to: 'r2' },
      { from: 'r2', to: 'm2' },
      { from: 'd2', to: 'm2' },
      { from: 'm2', to: 'h1' },
      { from: 'h1', to: 'm3' },
      { from: 'm2', to: 'm3' },
    ],
    head: 'm3',
    branches: { main: 'm3', develop: 'd2', 'feature/ui': 'f2', 'release/v2': 'r2', 'hotfix/login': 'h1' },
  },

  /** Cherry-pick demonstration */
  cherry_pick: {
    description: 'Cherry-pick: copy a commit from one branch to another',
    nodes: [
      { id: 'a1', branch: 'main',         message: 'Setup project',      sha: 'a1b2c3d' },
      { id: 'b2', branch: 'main',         message: 'v1 release',         sha: 'b2c3d4e' },
      { id: 'c3', branch: 'feature/auth', message: 'Add auth module',    sha: 'c3d4e5f' },
      { id: 'd4', branch: 'feature/auth', message: 'Fix XSS bug',        sha: 'd4e5f6g', cherry: true },
      { id: 'e5', branch: 'feature/auth', message: 'Add OAuth',          sha: 'e5f6g7h' },
      { id: "d4'", branch: 'main',        message: "Fix XSS bug (cherry-picked)", sha: "d4'copy", cherry_dest: true },
    ],
    edges: [
      { from: 'a1', to: 'b2' },
      { from: 'b2', to: 'c3' },
      { from: 'b2', to: "d4'" },
      { from: 'c3', to: 'd4' },
      { from: 'd4', to: 'e5' },
    ],
    head: "d4'",
    branches: { main: "d4'", 'feature/auth': 'e5' },
    cherry_from: 'd4',
    cherry_to: "d4'",
  },
}

// ──────────────────────────────────────────────────────────
// COMMIT GRAPH RENDERER HELPERS
// ──────────────────────────────────────────────────────────

/** Generate SVG path between two nodes */
export function buildEdgePath(from, to) {
  if (from.y === to.y) {
    // Same lane: straight line
    return `M${from.x},${from.y} L${to.x},${to.y}`
  }
  // Different lanes: cubic bezier
  const cx1 = from.x + (to.x - from.x) * 0.5
  const cy1 = from.y
  const cx2 = from.x + (to.x - from.x) * 0.5
  const cy2 = to.y
  return `M${from.x},${from.y} C${cx1},${cy1} ${cx2},${cy2} ${to.x},${to.y}`
}

/** Compute bounding box for a graph */
export function getGraphBounds(nodes) {
  if (!nodes.length) return { width: 500, height: 150 }
  const maxX = Math.max(...nodes.map(n => n.x))
  const maxY = Math.max(...nodes.map(n => n.y))
  return {
    width:  maxX + 80,
    height: maxY + 60,
  }
}
