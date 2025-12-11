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

export type AlgorithmType = 'bfs' | 'dfs' | 'louvain'




