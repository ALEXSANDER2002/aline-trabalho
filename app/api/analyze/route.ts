import { NextRequest, NextResponse } from 'next/server'
import Graph from 'graphology'
import louvain from 'graphology-communities-louvain'
import { GraphNode, GraphEdge } from '@/context/GraphContext'

// Implementação BFS para detecção de comunidades
function detectCommunitiesBFS(nodes: GraphNode[], edges: GraphEdge[]): Record<string, number> {
  const communities: Record<string, number> = {}
  const visited = new Set<string>()
  let communityId = 0

  // Criar mapa de adjacência
  const adjacencyMap = new Map<string, string[]>()
  nodes.forEach(node => {
    adjacencyMap.set(node.id, node.connections || [])
  })

  // BFS para cada componente não visitado
  nodes.forEach(node => {
    if (visited.has(node.id)) return

    const queue: string[] = [node.id]
    visited.add(node.id)
    communities[node.id] = communityId

    while (queue.length > 0) {
      const current = queue.shift()!
      const neighbors = adjacencyMap.get(current) || []

      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          communities[neighbor] = communityId
          queue.push(neighbor)
        }
      })
    }

    communityId++
  })

  return communities
}

// Implementação DFS para detecção de comunidades
function detectCommunitiesDFS(nodes: GraphNode[], edges: GraphEdge[]): Record<string, number> {
  const communities: Record<string, number> = {}
  const visited = new Set<string>()
  let communityId = 0

  // Criar mapa de adjacência
  const adjacencyMap = new Map<string, string[]>()
  nodes.forEach(node => {
    adjacencyMap.set(node.id, node.connections || [])
  })

  // DFS recursivo
  function dfs(nodeId: string, currentCommunityId: number) {
    visited.add(nodeId)
    communities[nodeId] = currentCommunityId

    const neighbors = adjacencyMap.get(nodeId) || []
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        dfs(neighbor, currentCommunityId)
      }
    })
  }

  // Aplicar DFS para cada componente não visitado
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id, communityId)
      communityId++
    }
  })

  return communities
}

// Implementação Louvain usando graphology
function detectCommunitiesLouvain(nodes: GraphNode[], edges: GraphEdge[]): Record<string, number> {
  const graph = new Graph()

  // Adicionar nós
  nodes.forEach(node => {
    graph.addNode(node.id, {
      label: node.label,
      lat: node.lat,
      lon: node.lon
    })
  })

  // Adicionar arestas
  edges.forEach(edge => {
    if (!graph.hasEdge(edge.source, edge.target)) {
      graph.addEdge(edge.source, edge.target)
    }
  })

  // Aplicar algoritmo de Louvain
  const communities = louvain(graph)
  
  // Converter para formato esperado
  const result: Record<string, number> = {}
  graph.forEachNode((nodeId) => {
    result[nodeId] = communities[nodeId]
  })

  return result
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nodes, edges, algorithm } = body

    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return NextResponse.json(
        { error: 'Nós não fornecidos ou inválidos' },
        { status: 400 }
      )
    }

    let communities: Record<string, number>

    switch (algorithm) {
      case 'bfs':
        communities = detectCommunitiesBFS(nodes, edges || [])
        break
      case 'dfs':
        communities = detectCommunitiesDFS(nodes, edges || [])
        break
      case 'louvain':
        communities = detectCommunitiesLouvain(nodes, edges || [])
        break
      default:
        return NextResponse.json(
          { error: 'Algoritmo não suportado' },
          { status: 400 }
        )
    }

    return NextResponse.json({ communities })
  } catch (error) {
    console.error('Erro ao processar análise:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}






