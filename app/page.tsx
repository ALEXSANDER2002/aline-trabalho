'use client'

import { Suspense } from 'react'
import Globe3D from '@/components/Globe3D'
import ControlPanel from '@/components/ControlPanel'
import { GraphProvider } from '@/context/GraphContext'

export default function Home() {
  return (
    <GraphProvider>
      <main style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0
      }}>
        <Suspense fallback={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            width: '100vw',
            fontSize: '24px',
            color: '#fff',
            background: '#000'
          }}>
            Carregando globo...
          </div>
        }>
          <Globe3D />
        </Suspense>
        <ControlPanel />
      </main>
    </GraphProvider>
  )
}

