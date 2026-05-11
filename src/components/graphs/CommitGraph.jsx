import { useState, useEffect } from "react";
import { layoutGraph, buildEdgePath, getGraphBounds, getBranchColor, GRAPHS } from "@/data/graphs";

const NODE_R = 9;
const HEAD_R = 11;

function CommitNode({ node, isHead, isSelected, onClick, onHover, animated, delay = 0 }) {
  const color = getBranchColor(node.branch);
  const [visible, setVisible] = useState(!animated);

  useEffect(() => {
    if (!animated) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [animated, delay]);

  if (!visible) return null;

  return (
    <g
      className="commit-node-interactive"
      onClick={() => onClick?.(node)}
      onMouseEnter={() => onHover?.(node)}
      onMouseLeave={() => onHover?.(null)}
      style={{
        transformOrigin: `${node.x}px ${node.y}px`,
        animation: animated ? `nodeIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both` : "none",
        animationDelay: `${delay}ms`,
        cursor: "pointer",
      }}
    >
      {/* Glow ring for HEAD or selected */}
      {(isHead || isSelected) && (
        <circle
          cx={node.x}
          cy={node.y}
          r={isHead ? HEAD_R + 5 : NODE_R + 4}
          fill="none"
          stroke={isHead ? "white" : color}
          strokeWidth={1.5}
          opacity={0.4}
        />
      )}

      {/* Main node circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={isHead ? HEAD_R : NODE_R}
        fill={color}
        stroke={isHead ? "white" : "transparent"}
        strokeWidth={isHead ? 2 : 0}
        opacity={node.rebased ? 0.7 : 1}
        style={{ filter: isHead ? `drop-shadow(0 0 6px ${color})` : "none" }}
      />

      {/* Merge commit diamond overlay */}
      {node.merge && (
        <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize={9} fill="white"
          style={{ pointerEvents: "none", userSelect: "none" }}>M</text>
      )}

      {/* Rebased commit indicator */}
      {node.rebased && (
        <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize={7} fill="white"
          style={{ pointerEvents: "none", userSelect: "none" }}>′</text>
      )}

      {/* Short SHA below node */}
      <text x={node.x} y={node.y + 24} textAnchor="middle" fontSize={8.5}
        fill="var(--muted)" fontFamily="IBM Plex Mono"
        style={{ pointerEvents: "none", userSelect: "none" }}>
        {(node.sha || node.id).slice(0, 7)}
      </text>

      {/* Tag label */}
      {node.tag && (
        <g>
          <rect x={node.x - 18} y={node.y - 28} width={36} height={14} rx={3}
            fill="var(--amber-dim)" stroke="var(--amber)" strokeWidth={1} />
          <text x={node.x} y={node.y - 18} textAnchor="middle" fontSize={7.5}
            fill="var(--amber)" fontFamily="IBM Plex Mono" fontWeight="600"
            style={{ pointerEvents: "none", userSelect: "none" }}>
            {node.tag}
          </text>
        </g>
      )}

      {/* Cherry indicator */}
      {(node.cherry || node.cherry_dest) && (
        <g>
          <circle cx={node.x + 12} cy={node.y - 10} r={5} fill="var(--rose)" opacity={0.85}
            style={{ pointerEvents: "none" }} />
          <text x={node.x + 12} y={node.y - 7} textAnchor="middle" fontSize={7} fill="white"
            fontWeight="700" style={{ pointerEvents: "none", userSelect: "none" }}>C</text>
        </g>
      )}

      <title>{node.message || node.id}</title>
    </g>
  );
}

function EdgePath({ from, to, animated, delay = 0, color }) {
  const pathD = buildEdgePath(from, to);
  const edgeColor = color || getBranchColor(from.branch);
  const [visible, setVisible] = useState(!animated);

  useEffect(() => {
    if (!animated) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [animated, delay]);

  if (!visible) return null;

  return (
    <path d={pathD} stroke={edgeColor} strokeWidth={2} fill="none" opacity={0.65}
      className={animated ? "svg-line-animated" : ""}
      style={animated ? { animationDelay: `${delay}ms` } : {}} />
  );
}

function BranchLabel({ branch, node, color }) {
  const isAbove = node.y <= 55;
  const lx = node.x;
  const ly = isAbove ? node.y + 42 : node.y - 26;
  const w = Math.max(branch.length * 6.5 + 14, 60);

  return (
    <g>
      <rect x={lx - w / 2} y={ly - 11} width={w} height={16} rx={4}
        fill={`${color}20`} stroke={color} strokeWidth={1} />
      <text x={lx} y={ly + 1} textAnchor="middle" fontSize={8} fill={color}
        fontFamily="IBM Plex Mono" fontWeight="700"
        style={{ pointerEvents: "none", userSelect: "none" }}>
        {branch}
      </text>
    </g>
  );
}

function HeadPointer({ node }) {
  const x = node.x;
  const y = node.y - 16;
  return (
    <g style={{ animation: "headArrow 0.4s ease both" }}>
      <text x={x} y={y - 10} textAnchor="middle" fontSize={9}
        fill="var(--accent)" fontFamily="IBM Plex Mono" fontWeight="700">HEAD</text>
      <line x1={x} y1={y - 6} x2={x} y2={y - 1}
        stroke="var(--accent)" strokeWidth={1.5} markerEnd="url(#headArrow)" />
    </g>
  );
}

/** SVG-native hover tooltip — rendered last so it sits on top of all nodes */
function CommitTooltip({ node, svgWidth }) {
  if (!node) return null;

  const color = getBranchColor(node.branch);
  const TW = 192;
  const TH = node.time ? 80 : 64;
  const hasTime = Boolean(node.time);

  // Flip left if node is near the right edge
  const tx = node.x + 14 + TW > (svgWidth || 999) ? node.x - TW - 14 : node.x + 14;
  // Flip down if node is near the top
  const ty = node.y > 70 ? node.y - TH - 4 : node.y + NODE_R + 18;

  const sha = (node.sha || node.id).slice(0, 8);
  const msg = node.message || "";
  const displayMsg = msg.length > 26 ? msg.slice(0, 26) + "…" : msg;

  return (
    <g style={{ pointerEvents: "none" }}>
      {/* Drop shadow */}
      <rect x={tx + 3} y={ty + 3} width={TW} height={TH} rx={6} fill="rgba(0,0,0,0.35)" />
      {/* Box */}
      <rect x={tx} y={ty} width={TW} height={TH} rx={6} fill="#0d0d1f" stroke={color} strokeWidth={1.2} />
      {/* Top accent bar */}
      <rect x={tx} y={ty} width={TW} height={3} rx={0} fill={color} opacity={0.7} />

      {/* SHA */}
      <text x={tx + 10} y={ty + 18} fontSize={9.5} fill="#f59e0b"
        fontFamily="IBM Plex Mono" fontWeight="700" style={{ userSelect: "none" }}>
        {sha}
      </text>

      {/* Message */}
      <text x={tx + 10} y={ty + 32} fontSize={9} fill="#d4d4f4"
        fontFamily="IBM Plex Mono" style={{ userSelect: "none" }}>
        {displayMsg}
      </text>

      {/* Branch */}
      <text x={tx + 10} y={ty + 47} fontSize={8.5} fill={color}
        fontFamily="IBM Plex Mono" style={{ userSelect: "none" }}>
        ⎇ {node.branch}
      </text>

      {/* Author */}
      <text x={tx + 10} y={ty + 61} fontSize={8} fill="#5a5a8a"
        fontFamily="IBM Plex Mono" style={{ userSelect: "none" }}>
        Developer{node.merge ? " · merge commit" : ""}
      </text>

      {/* Time */}
      {hasTime && (
        <text x={tx + 10} y={ty + 74} fontSize={8} fill="#3a3a60"
          fontFamily="IBM Plex Mono" style={{ userSelect: "none" }}>
          {node.time}
        </text>
      )}
    </g>
  );
}

/**
 * CommitGraph
 * @param {string}   scenario      - key from GRAPHS data
 * @param {object}   customGraph   - override with custom {nodes, edges, head, branches}
 * @param {boolean}  animated      - enable node/line entrance animations
 * @param {boolean}  showLabels    - show branch labels
 * @param {boolean}  showHead      - show HEAD pointer
 * @param {function} onNodeClick   - callback(node)
 */
export default function CommitGraph({
  scenario = "feature_branch",
  customGraph,
  animated = true,
  showLabels = true,
  showHead = true,
  onNodeClick,
  className = "",
  style = {},
}) {
  const [selected, setSelected] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const graphDef = customGraph || GRAPHS[scenario] || GRAPHS.feature_branch;

  const laidOut = layoutGraph(graphDef.nodes, graphDef.edges);
  const { width, height } = getGraphBounds(laidOut);

  const nodeMap = {};
  laidOut.forEach((n) => { nodeMap[n.id] = n; });

  const headNode = nodeMap[graphDef.head];
  const svgWidth = width + 20;

  const handleNodeClick = (node) => {
    setSelected(node.id === selected ? null : node.id);
    onNodeClick?.(node);
  };

  return (
    <div className={className} style={{ overflow: "auto", ...style }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${height + 20}`}
        style={{ width: "100%", minWidth: Math.min(svgWidth, 300), maxHeight: 220, overflow: "visible" }}
      >
        <defs>
          <marker id="headArrow" markerWidth={6} markerHeight={6} refX={3} refY={3} orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* Edges */}
        {graphDef.edges.map((edge, i) => {
          const from = nodeMap[edge.from];
          const to = nodeMap[edge.to];
          if (!from || !to) return null;
          return (
            <EdgePath key={`${edge.from}-${edge.to}`} from={from} to={to}
              animated={animated} delay={i * 60} color={getBranchColor(from.branch)} />
          );
        })}

        {/* Nodes */}
        {laidOut.map((node, i) => (
          <CommitNode
            key={node.id}
            node={node}
            isHead={node.id === graphDef.head}
            isSelected={node.id === selected}
            onClick={handleNodeClick}
            onHover={setHoveredNode}
            animated={animated}
            delay={graphDef.edges.length * 60 + i * 70}
          />
        ))}

        {/* HEAD pointer */}
        {showHead && headNode && <HeadPointer node={headNode} />}

        {/* Branch labels */}
        {showLabels && graphDef.branches &&
          Object.entries(graphDef.branches).map(([branch, nodeId]) => {
            const node = nodeMap[nodeId];
            if (!node) return null;
            return <BranchLabel key={branch} branch={branch} node={node} color={getBranchColor(branch)} />;
          })}

        {/* Hover tooltip — rendered last so it appears above everything */}
        {hoveredNode && nodeMap[hoveredNode.id] && (
          <CommitTooltip node={nodeMap[hoveredNode.id]} svgWidth={svgWidth} />
        )}
      </svg>

      {/* Click-selected node detail bar */}
      {selected && nodeMap[selected] && (
        <div className="animate-fade-in" style={{
          marginTop: 8, padding: "8px 12px",
          background: "var(--surface)", border: "1px solid var(--border-b)",
          borderRadius: 8, fontSize: 12, fontFamily: "IBM Plex Mono",
          display: "flex", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ color: "var(--amber)" }}>{nodeMap[selected].sha || nodeMap[selected].id}</span>
          <span style={{ color: "var(--muted)" }}>branch:</span>
          <span style={{ color: getBranchColor(nodeMap[selected].branch) }}>{nodeMap[selected].branch}</span>
          <span style={{ color: "var(--muted)" }}>│</span>
          <span style={{ color: "var(--text)" }}>{nodeMap[selected].message}</span>
          {nodeMap[selected].time && (
            <>
              <span style={{ color: "var(--muted)" }}>│</span>
              <span style={{ color: "var(--dim)" }}>{nodeMap[selected].time}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
