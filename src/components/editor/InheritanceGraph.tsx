'use client'

import { useMemo, useCallback } from 'react'
import type { Group } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ColorPreview } from './ColorPreview'

interface InheritanceGraphProps {
  groups: Group[]
  selectedGroup: string | null
  onSelect: (name: string) => void
}

interface LayoutNode {
  group: Group
  x: number
  y: number
  level: number
}

export function InheritanceGraph({ groups, selectedGroup, onSelect }: InheritanceGraphProps) {
  // Build the graph layout
  const { nodes, edges } = useMemo(() => {
    if (groups.length === 0) {
      return { nodes: [], edges: [] }
    }

    // Create a map of group name to children (groups that have this as parent)
    const childrenMap = new Map<string, string[]>()
    groups.forEach(g => {
      g.parents.forEach(parent => {
        const existing = childrenMap.get(parent) || []
        existing.push(g.name)
        childrenMap.set(parent, existing)
      })
    })

    // Find root nodes (groups with no parents)
    const roots = groups.filter(g => g.parents.length === 0)
    
    // Calculate levels using BFS
    const levelMap = new Map<string, number>()
    const visited = new Set<string>()
    const queue: { name: string; level: number }[] = []
    
    // Start with roots at level 0
    roots.forEach(g => {
      queue.push({ name: g.name, level: 0 })
    })
    
    while (queue.length > 0) {
      const { name, level } = queue.shift()!
      if (visited.has(name)) continue
      visited.add(name)
      levelMap.set(name, level)
      
      const children = childrenMap.get(name) || []
      children.forEach(child => {
        if (!visited.has(child)) {
          queue.push({ name: child, level: level + 1 })
        }
      })
    }
    
    // Handle any unvisited nodes (circular references or orphans)
    groups.forEach(g => {
      if (!levelMap.has(g.name)) {
        levelMap.set(g.name, 0)
      }
    })
    
    // Group nodes by level
    const levelGroups = new Map<number, Group[]>()
    groups.forEach(g => {
      const level = levelMap.get(g.name) || 0
      const existing = levelGroups.get(level) || []
      existing.push(g)
      levelGroups.set(level, existing)
    })
    
    // Sort each level by weight (highest first)
    levelGroups.forEach((groupsAtLevel, level) => {
      groupsAtLevel.sort((a, b) => b.weight - a.weight)
      levelGroups.set(level, groupsAtLevel)
    })
    
    // Calculate positions - horizontal layout
    const nodeWidth = 180
    const nodeHeight = 70
    const horizontalGap = 60
    const verticalGap = 100
    
    const nodes: LayoutNode[] = []
    
    levelGroups.forEach((groupsAtLevel, level) => {
      const totalHeight = groupsAtLevel.length * nodeHeight + (groupsAtLevel.length - 1) * verticalGap
      const startY = -totalHeight / 2
      
      groupsAtLevel.forEach((g, index) => {
        const x = level * (nodeWidth + horizontalGap)
        const y = startY + index * (nodeHeight + verticalGap)
        
        nodes.push({
          group: g,
          x,
          y,
          level,
        })
      })
    })
    
    // Create edges (from parent to child - left to right)
    const nodeMap = new Map(nodes.map(n => [n.group.name, n]))
    const edges: { from: string; to: string; fromX: number; fromY: number; toX: number; toY: number }[] = []
    
    groups.forEach(g => {
      const childNode = nodeMap.get(g.name)
      if (!childNode) return
      
      g.parents.forEach(parentName => {
        const parentNode = nodeMap.get(parentName)
        if (!parentNode) return
        
        edges.push({
          from: parentName,
          to: g.name,
          fromX: parentNode.x + nodeWidth,
          fromY: parentNode.y + nodeHeight / 2,
          toX: childNode.x,
          toY: childNode.y + nodeHeight / 2,
        })
      })
    })
    
    return { nodes, edges }
  }, [groups])

  // Calculate SVG bounds
  const bounds = useMemo(() => {
    if (nodes.length === 0) {
      return { minX: 0, maxX: 400, minY: 0, maxY: 300 }
    }
    
    const nodeWidth = 180
    const nodeHeight = 70
    const padding = 40
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    nodes.forEach(node => {
      minX = Math.min(minX, node.x)
      maxX = Math.max(maxX, node.x + nodeWidth)
      minY = Math.min(minY, node.y)
      maxY = Math.max(maxY, node.y + nodeHeight)
    })
    
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding,
    }
  }, [nodes])

  const viewBox = `${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`

  const handleNodeClick = useCallback((groupName: string) => {
    onSelect(groupName)
  }, [onSelect])

  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-hp-text-muted">
        <p>No groups to visualize</p>
      </div>
    )
  }

  const nodeWidth = 180
  const nodeHeight = 70

  return (
    <div className="w-full h-full bg-hp-bg/30 overflow-auto">
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="min-w-full min-h-full"
        style={{ minWidth: `${bounds.maxX - bounds.minX}px`, minHeight: `${bounds.maxY - bounds.minY}px` }}
      >
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="8"
            refY="3.5"
            orient="auto"
            fill="#8b5cf6"
          >
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
          <marker
            id="arrowhead-selected"
            markerWidth="10"
            markerHeight="7"
            refX="8"
            refY="3.5"
            orient="auto"
            fill="#22c55e"
          >
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
        </defs>

        {/* Draw edges (inheritance lines) */}
        {edges.map((edge, idx) => {
          const isSelected = selectedGroup === edge.from || selectedGroup === edge.to
          const midX = (edge.fromX + edge.toX) / 2
          
          return (
            <path
              key={`${edge.from}-${edge.to}-${idx}`}
              d={`M ${edge.fromX} ${edge.fromY} 
                  C ${midX} ${edge.fromY}, 
                    ${midX} ${edge.toY}, 
                    ${edge.toX} ${edge.toY}`}
              fill="none"
              stroke={isSelected ? '#22c55e' : '#8b5cf6'}
              strokeWidth={isSelected ? 3 : 2}
              strokeOpacity={isSelected ? 1 : 0.6}
              markerEnd={isSelected ? 'url(#arrowhead-selected)' : 'url(#arrowhead)'}
            />
          )
        })}

        {/* Draw nodes */}
        {nodes.map(node => {
          const isSelected = selectedGroup === node.group.name
          const isParent = selectedGroup && groups.find(g => g.name === selectedGroup)?.parents.includes(node.group.name)
          const isChild = selectedGroup && node.group.parents.includes(selectedGroup)
          
          let borderColor = '#3f3f46' // zinc-700
          if (isSelected) borderColor = '#8b5cf6' // purple
          else if (isParent) borderColor = '#22c55e' // green
          else if (isChild) borderColor = '#f59e0b' // amber
          
          return (
            <g
              key={node.group.name}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => handleNodeClick(node.group.name)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
            >
              {/* Node background */}
              <rect
                width={nodeWidth}
                height={nodeHeight}
                rx={8}
                fill="#18181b"
                stroke={borderColor}
                strokeWidth={isSelected || isParent || isChild ? 3 : 1}
              />
              
              {/* Weight indicator bar */}
              <rect
                x={0}
                y={0}
                width={5}
                height={nodeHeight}
                rx={4}
                fill={getWeightColor(node.group.weight)}
              />
              
              {/* Group name */}
              <foreignObject x={12} y={10} width={nodeWidth - 20} height={28}>
                <div className="flex items-center gap-1.5 truncate">
                  {node.group.prefix && (
                    <ColorPreview text={node.group.prefix} className="text-sm" />
                  )}
                  <span className={cn(
                    'text-sm font-medium truncate',
                    isSelected ? 'text-hp-primary' : 'text-hp-text'
                  )}>
                    {node.group.displayName || node.group.name}
                  </span>
                </div>
              </foreignObject>
              
              {/* Meta info */}
              <text
                x={14}
                y={nodeHeight - 14}
                className="text-[11px]"
                fill="#71717a"
              >
                Weight: {node.group.weight} • {node.group.permissions.length} perms
                {node.group.parents.length > 0 && ` • ${node.group.parents.length} parent${node.group.parents.length > 1 ? 's' : ''}`}
              </text>
            </g>
          )
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 bg-hp-surface/90 backdrop-blur-sm rounded-lg px-4 py-2 text-xs text-hp-text-muted border border-hp-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-hp-primary" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-hp-success" />
          <span>Parent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-hp-warning" />
          <span>Child</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-hp-primary font-bold">→</span>
          <span>Inherits from</span>
        </div>
      </div>
    </div>
  )
}

// Get gradient color from purple (low weight) to gold (high weight)
function getWeightColor(weight: number, maxWeight: number = 100): string {
  const ratio = Math.min(weight / maxWeight, 1)
  const hue = 270 - (ratio * 225) // Purple to gold
  return `hsl(${hue}, 70%, 55%)`
}
