'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export interface GraphNode {
  id: string
  label?: string
  lat: number
  lon: number
  connections?: string[]
}

export interface GraphEdge {
  source: string
  target: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

interface GraphContextType {
  nodes: GraphNode[]
  communities: Record<string, number>
  algorithm: 'bfs' | 'dfs' | 'louvain'
  setAlgorithm: (alg: 'bfs' | 'dfs' | 'louvain') => void
  loadGraph: (data: GraphData) => void
  analyzeCommunities: () => Promise<void>
  isLoading: boolean
  stats: {
    totalNodes: number
    totalEdges: number
    totalCommunities: number
    algorithm?: string
  }
  demoState: {
    isRunning: boolean
    visitedNodes: Set<string>
    currentNode: string | null
    queue: string[]
    step: number
    distances: Record<string, number>
  }
  startDemo: (startNodeId: string, algorithm: 'bfs' | 'dfs') => void
  stopDemo: () => void
}

const GraphContext = createContext<GraphContextType | undefined>(undefined)

export function GraphProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [communities, setCommunities] = useState<Record<string, number>>({})
  const [algorithm, setAlgorithm] = useState<'bfs' | 'dfs' | 'louvain'>('louvain')
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  
  // Estado da demonstração
  const [demoState, setDemoState] = useState({
    isRunning: false,
    visitedNodes: new Set<string>(),
    currentNode: null as string | null,
    queue: [] as string[],
    step: 0,
    distances: {} as Record<string, number>
  })

  // Carregar dados mockados automaticamente ao iniciar
  useEffect(() => {
    if (!dataLoaded && nodes.length === 0) {
      console.log('GraphContext: Iniciando carregamento de dados mockados...')
      const loadMockData = async () => {
        try {
          const response = await fetch('/mock-users-data.json')
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          console.log('GraphContext: Dados carregados:', {
            nodes: data.nodes?.length || 0,
            edges: data.edges?.length || 0
          })
          
          // Processar nós e adicionar conexões
          const processedNodes = data.nodes.map((node: GraphNode) => {
            const nodeEdges = data.edges.filter(
              (e: GraphEdge) => e.source === node.id || e.target === node.id
            )
            const connections = nodeEdges.map((e: GraphEdge) => 
              e.source === node.id ? e.target : e.source
            )
            return { ...node, connections }
          })

          console.log('GraphContext: Nós processados:', processedNodes.length)
          console.log('GraphContext: Primeiro nó:', processedNodes[0])
          
          setNodes(processedNodes)
          setEdges(data.edges)
          setDataLoaded(true)
          console.log('GraphContext: Estado atualizado com sucesso')
        } catch (error) {
          console.error('GraphContext: Erro ao carregar dados mockados:', error)
        }
      }
      loadMockData()
    }
  }, [dataLoaded, nodes.length])

  const loadGraph = (data: GraphData) => {
    // Processar nós e adicionar conexões
    const processedNodes = data.nodes.map(node => {
      const nodeEdges = data.edges.filter(
        e => e.source === node.id || e.target === node.id
      )
      const connections = nodeEdges.map(e => 
        e.source === node.id ? e.target : e.source
      )
      return { ...node, connections }
    })

    setNodes(processedNodes)
    setEdges(data.edges)
    setCommunities({})
  }

  const analyzeCommunities = async () => {
    if (nodes.length === 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          algorithm
        })
      })

      const result = await response.json()
      setCommunities(result.communities)
    } catch (error) {
      console.error('Erro ao analisar comunidades:', error)
      alert('Erro ao analisar comunidades. Verifique o console.')
    } finally {
      setIsLoading(false)
    }
  }

  const stats = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    totalCommunities: Object.keys(
      Object.fromEntries(
        Object.entries(communities).map(([_, v]) => [v, true])
      )
    ).length,
    algorithm: communities && Object.keys(communities).length > 0 
      ? algorithm.toUpperCase() 
      : undefined
  }

  const stopDemo = () => {
    setDemoState({
      isRunning: false,
      visitedNodes: new Set(),
      currentNode: null,
      queue: [],
      step: 0,
      distances: {}
    })
  }

  const startDemo = async (startNodeId: string, demoAlgorithm: 'bfs' | 'dfs') => {
    stopDemo()
    setDemoState(prev => ({ ...prev, isRunning: true }))
    
    if (demoAlgorithm === 'bfs') {
      await runBFSDemo(startNodeId)
    } else {
      await runDFSDemo(startNodeId, new Set(), {}, 0, 0)
    }
    
    setDemoState(prev => ({ ...prev, isRunning: false, currentNode: null }))
  }

  const runBFSDemo = async (startNodeId: string) => {
    const visitedSet = new Set<string>()
    const queueArray = [startNodeId]
    const distances: Record<string, number> = { [startNodeId]: 0 }
    let step = 0

    while (queueArray.length > 0) {
      const current = queueArray.shift()!
      if (visitedSet.has(current)) continue

      setDemoState(prev => ({
        ...prev,
        currentNode: current,
        queue: [...queueArray],
        step: ++step,
        distances: { ...distances }
      }))
      await new Promise(resolve => setTimeout(resolve, 800))

      visitedSet.add(current)
      setDemoState(prev => ({ ...prev, visitedNodes: new Set(visitedSet) }))

      const node = nodes.find(n => n.id === current)
      if (node?.connections) {
        for (const neighborId of node.connections) {
          if (!visitedSet.has(neighborId) && !queueArray.includes(neighborId)) {
            queueArray.push(neighborId)
            distances[neighborId] = distances[current] + 1
          }
        }
      }
      setDemoState(prev => ({ ...prev, queue: [...queueArray], distances: { ...distances } }))
      await new Promise(resolve => setTimeout(resolve, 400))
    }
  }

  const runDFSDemo = async (
    nodeId: string, 
    visitedSet: Set<string>, 
    distances: Record<string, number>,
    depth: number,
    step: number
  ): Promise<number> => {
    if (visitedSet.has(nodeId)) return step

    setDemoState(prev => ({
      ...prev,
      currentNode: nodeId,
      step: ++step,
      distances: { ...distances, [nodeId]: depth }
    }))
    await new Promise(resolve => setTimeout(resolve, 800))

    visitedSet.add(nodeId)
    setDemoState(prev => ({ ...prev, visitedNodes: new Set(visitedSet) }))

    const node = nodes.find(n => n.id === nodeId)
    if (node?.connections) {
      for (const neighborId of node.connections) {
        if (!visitedSet.has(neighborId)) {
          step = await runDFSDemo(neighborId, visitedSet, distances, depth + 1, step)
        }
      }
    }
    return step
  }

  return (
    <GraphContext.Provider
      value={{
        nodes,
        communities,
        algorithm,
        setAlgorithm,
        loadGraph,
        analyzeCommunities,
        isLoading,
        stats,
        demoState,
        startDemo,
        stopDemo
      }}
    >
      {children}
    </GraphContext.Provider>
  )
}

export function useGraph() {
  const context = useContext(GraphContext)
  if (context === undefined) {
    throw new Error('useGraph deve ser usado dentro de GraphProvider')
  }
  return context
}

