"use client"

import { Block } from "./types"
import { BLOCK_DEFINITIONS } from "./registry"

interface LiveSiteRendererProps {
  blocks: Block[]
  primaryColor?: string
  fontFamily?: string
  previewMode?: boolean
}

export function LiveSiteRenderer({ blocks, primaryColor, fontFamily, previewMode = false }: LiveSiteRendererProps) {
  return (
    <div 
      className="min-h-screen bg-background"
      style={{ 
        fontFamily: fontFamily || 'Inter',
        '--primary': primaryColor || '#3b82f6',
      } as React.CSSProperties}
    >
      {blocks.map((block) => {
        const def = BLOCK_DEFINITIONS[block.type]
        if (!def) return null
        
        const Component = def.component
        return (
          <Component
            key={block.id}
            block={block}
            onChange={() => {}}
            selected={false}
          />
        )
      })}
    </div>
  )
}
