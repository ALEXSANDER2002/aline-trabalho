'use client'

import { useState } from 'react'
import { useGraph } from '@/context/GraphContext'
import styles from './ControlPanel.module.css'

export default function ControlPanel() {
  const {
    loadGraph,
    analyzeCommunities,
    algorithm,
    setAlgorithm,
    isLoading,
    stats,
    demoState = {
      isRunning: false,
      visitedNodes: new Set(),
      currentNode: null,
      queue: [],
      step: 0,
      distances: {}
    },
    startDemo = () => {},
    stopDemo = () => {},
    nodes
  } = useGraph()

  const [isExpanded, setIsExpanded] = useState(true)
  const [demoAlgorithm, setDemoAlgorithm] = useState<'bfs' | 'dfs'>('bfs')
  const [selectedNodeForDemo, setSelectedNodeForDemo] = useState<string>('')

  const handleAnalyze = () => {
    analyzeCommunities()
  }

  const togglePanel = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* Botão Hambúrguer */}
      <button
        onClick={togglePanel}
        className={styles.hamburgerButton}
        aria-label={isExpanded ? 'Recolher painel' : 'Expandir painel'}
      >
        <div className={`${styles.hamburgerIcon} ${isExpanded ? styles.open : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Painel */}
      <div className={`${styles.panel} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      <h2 className={styles.title}>Análise de Redes Sociais</h2>
      
      {/* Botão para alternar visualização das texturas */}
      <div className={styles.section}>
        <button
          onClick={() => {
            const wwd = (window as any).wwdInstance
            if (wwd && wwd.layers) {
              const bmng = wwd.layers.find((l: any) => l.displayName === 'Blue Marble')
              const landsat = wwd.layers.find((l: any) => l.displayName === 'Blue Marble & Landsat')
              if (bmng) {
                bmng.enabled = !bmng.enabled
                console.log('Blue Marble:', bmng.enabled ? 'Ativado' : 'Desativado')
              }
              if (landsat) {
                landsat.enabled = !landsat.enabled
                console.log('Landsat:', landsat.enabled ? 'Ativado' : 'Desativado')
              }
              wwd.redraw()
            }
          }}
          className={styles.button}
          style={{ marginBottom: '15px', fontSize: '12px' }}
        >
          Alternar Texturas da Terra
        </button>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Algoritmo de Detecção:
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as 'bfs' | 'dfs' | 'louvain')}
            className={styles.select}
          >
            <option value="louvain">Louvain (Recomendado)</option>
            <option value="bfs">BFS - Breadth-First Search</option>
            <option value="dfs">DFS - Depth-First Search</option>
          </select>
        </label>
        <div className={styles.algorithmInfo}>
          <details>
            <summary style={{ cursor: 'pointer', color: '#888', marginTop: '8px', userSelect: 'none' }}>
              Sobre os Algoritmos
            </summary>
            <div style={{ marginTop: '12px', fontSize: '12px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#e0e0e0' }}>Louvain:</strong>
                <ul style={{ marginLeft: '16px', marginTop: '4px', color: '#ccc' }}>
                  <li>Algoritmo otimizado para modularidade</li>
                  <li>Detecta comunidades baseadas na densidade de conexões</li>
                  <li>Mais preciso para redes sociais reais</li>
                  <li>Pode encontrar comunidades sobrepostas</li>
                  <li>Complexidade: O(n log n)</li>
                </ul>
                <div style={{ marginTop: '8px', padding: '8px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', fontSize: '11px' }}>
                  <strong style={{ color: '#e0e0e0' }}>Por que muitas comunidades?</strong>
                  <p style={{ marginTop: '4px', color: '#aaa' }}>
                    O Louvain identifica grupos onde há <strong>mais conexões internas</strong> do que externas. 
                    Com 100+ usuários em várias cidades, ele encontra:
                  </p>
                  <ul style={{ marginLeft: '16px', marginTop: '4px', color: '#aaa' }}>
                    <li>Comunidades locais (mesma cidade)</li>
                    <li>Comunidades regionais (mesmo continente)</li>
                    <li>Comunidades por padrões de conexão</li>
                  </ul>
                  <p style={{ marginTop: '6px', color: '#aaa', fontSize: '10px' }}>
                    Isso é normal e mostra a estrutura real da rede!
                  </p>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#e0e0e0' }}>BFS (Breadth-First Search):</strong>
                <ul style={{ marginLeft: '16px', marginTop: '4px', color: '#ccc' }}>
                  <li>Busca em largura - explora nível por nível</li>
                  <li>Identifica componentes conectados</li>
                  <li>Cada componente é uma comunidade</li>
                  <li>Mais simples, mas menos preciso</li>
                  <li>Complexidade: O(V + E)</li>
                </ul>
              </div>
              <div>
                <strong style={{ color: '#e0e0e0' }}>DFS (Depth-First Search):</strong>
                <ul style={{ marginLeft: '16px', marginTop: '4px', color: '#ccc' }}>
                  <li>Busca em profundidade - explora até o fim</li>
                  <li>Também identifica componentes conectados</li>
                  <li>Similar ao BFS, mas com estratégia diferente</li>
                  <li>Útil para redes hierárquicas</li>
                  <li>Complexidade: O(V + E)</li>
                </ul>
              </div>
            </div>
          </details>
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isLoading || stats.totalNodes === 0}
        className={styles.button}
      >
        {isLoading ? 'Analisando...' : 'Detectar Comunidades'}
      </button>

      {/* Seção de Demonstração */}
      <div className={styles.section} style={{ marginTop: '24px', borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
        <h3 style={{ color: '#e0e0e0', marginBottom: '8px', fontSize: '14px', fontWeight: '600', letterSpacing: '0.5px' }}>Demonstração Visual</h3>
        <p style={{ fontSize: '11px', color: '#888', marginBottom: '16px', lineHeight: '1.5' }}>
          Visualize como os algoritmos exploram a rede
        </p>
        
        <label className={styles.label}>
          Algoritmo de Busca:
          <select
            value={demoAlgorithm}
            onChange={(e) => setDemoAlgorithm(e.target.value as 'bfs' | 'dfs')}
            className={styles.select}
            disabled={demoState.isRunning}
          >
            <option value="bfs">BFS - Expansão em Ondas</option>
            <option value="dfs">DFS - Exploração em Profundidade</option>
          </select>
        </label>

        <label className={styles.label}>
          Nó Inicial:
          <select
            value={selectedNodeForDemo}
            onChange={(e) => setSelectedNodeForDemo(e.target.value)}
            className={styles.select}
            disabled={demoState.isRunning || nodes.length === 0}
          >
            <option value="">Selecione um usuário...</option>
            {nodes.map(node => (
              <option key={node.id} value={node.id}>
                {node.label || node.id}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={() => selectedNodeForDemo && startDemo(selectedNodeForDemo, demoAlgorithm)}
            disabled={demoState.isRunning || !selectedNodeForDemo || nodes.length === 0}
            className={styles.button}
            style={{ 
              flex: 1, 
              background: demoState.isRunning || !selectedNodeForDemo ? '#2a2a2a' : '#1a1a1a',
              border: '1px solid #404040',
              color: demoState.isRunning || !selectedNodeForDemo ? '#666' : '#e0e0e0',
              fontSize: '12px',
              padding: '10px'
            }}
          >
            {demoState.isRunning ? '▶ Executando...' : '▶ Iniciar'}
          </button>
          <button
            onClick={stopDemo}
            disabled={!demoState.isRunning}
            className={styles.button}
            style={{ 
              flex: 1, 
              background: !demoState.isRunning ? '#2a2a2a' : '#1a1a1a',
              border: '1px solid #404040',
              color: !demoState.isRunning ? '#666' : '#e0e0e0',
              fontSize: '12px',
              padding: '10px'
            }}
          >
            ⏹ Parar
          </button>
        </div>

        {demoState.isRunning && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#1a1a1a', 
            border: '1px solid #2a2a2a',
            borderRadius: '4px' 
          }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Passo <strong style={{ color: '#e0e0e0' }}>{demoState.step}</strong></span>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{demoAlgorithm}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#666', display: 'grid', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Nó atual:</span>
                <strong style={{ color: '#e0e0e0' }}>{demoState.currentNode || '-'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Visitados:</span>
                <strong style={{ color: '#e0e0e0' }}>{demoState.visitedNodes.size} / {nodes.length}</strong>
              </div>
              {demoAlgorithm === 'bfs' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fila:</span>
                  <strong style={{ color: '#e0e0e0' }}>{demoState.queue.length}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        <details style={{ marginTop: '16px' }}>
          <summary style={{ cursor: 'pointer', color: '#888', fontSize: '11px', userSelect: 'none' }}>
            Como funciona
          </summary>
          <div style={{ marginTop: '12px', fontSize: '10px', lineHeight: '1.6', color: '#666', borderLeft: '2px solid #2a2a2a', paddingLeft: '12px' }}>
            <p style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#e0e0e0' }}>BFS - Breadth-First:</strong>
            </p>
            <ul style={{ marginLeft: '16px', marginBottom: '12px', fontSize: '10px', listStyle: 'none', paddingLeft: 0 }}>
              <li style={{ marginBottom: '4px' }}>• Explora por camadas</li>
              <li style={{ marginBottom: '4px' }}>• Visita todos os vizinhos antes de avançar</li>
              <li style={{ marginBottom: '4px' }}>• Padrão de expansão em ondas</li>
            </ul>
            
            <p style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#e0e0e0' }}>DFS - Depth-First:</strong>
            </p>
            <ul style={{ marginLeft: '16px', fontSize: '10px', listStyle: 'none', paddingLeft: 0 }}>
              <li style={{ marginBottom: '4px' }}>• Explora o mais fundo possível</li>
              <li style={{ marginBottom: '4px' }}>• Retrocede quando necessário</li>
              <li style={{ marginBottom: '4px' }}>• Padrão de exploração em árvore</li>
            </ul>
          </div>
        </details>
      </div>

      {stats.totalNodes > 0 && (
        <div className={styles.stats}>
          <h3>Estatísticas</h3>
          <p>Nós: {stats.totalNodes}</p>
          <p>Conexões: {stats.totalEdges}</p>
          <p>Comunidades: {stats.totalCommunities}</p>
          {stats.algorithm && <p>Algoritmo: {stats.algorithm}</p>}
        </div>
      )}

      <div className={styles.help}>
        <h4>Formato do JSON:</h4>
        <pre className={styles.code}>
{`{
  "nodes": [
    {
      "id": "node1",
      "label": "Usuário 1",
      "lat": -23.5505,
      "lon": -46.6333
    }
  ],
  "edges": [
    {
      "source": "node1",
      "target": "node2"
    }
  ]
}`}
        </pre>
        <details style={{ marginTop: '12px' }}>
          <summary style={{ cursor: 'pointer', color: '#888', fontSize: '11px', userSelect: 'none' }}>
            Como os Algoritmos Processam o JSON
          </summary>
          <div style={{ marginTop: '12px', fontSize: '10px', lineHeight: '1.6', color: '#666', borderLeft: '2px solid #2a2a2a', paddingLeft: '12px' }}>
            <p style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#e0e0e0' }}>1. Processamento Inicial:</strong>
            </p>
            <ul style={{ marginLeft: '16px', marginBottom: '12px', listStyle: 'none', paddingLeft: 0 }}>
              <li style={{ marginBottom: '4px' }}>• O sistema lê os <code>nodes</code> e <code>edges</code></li>
              <li style={{ marginBottom: '4px' }}>• Para cada nó, calcula suas <code>connections</code> automaticamente</li>
              <li style={{ marginBottom: '4px' }}>• Cria um mapa: &quot;quem está conectado com quem&quot;</li>
            </ul>
            
            <p style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#e0e0e0' }}>2. BFS/DFS:</strong>
            </p>
            <ul style={{ marginLeft: '16px', marginBottom: '12px', listStyle: 'none', paddingLeft: 0 }}>
              <li style={{ marginBottom: '4px' }}>• Usa o mapa de conexões para explorar a rede</li>
              <li style={{ marginBottom: '4px' }}>• Identifica componentes conectados</li>
              <li style={{ marginBottom: '4px' }}>• Cada componente = uma comunidade</li>
              <li style={{ marginBottom: '4px' }}>• Resultado: poucas comunidades grandes</li>
            </ul>
            
            <p style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#e0e0e0' }}>3. Louvain:</strong>
            </p>
            <ul style={{ marginLeft: '16px', marginBottom: '12px' }}>
              <li>Analisa a <strong>densidade</strong> de conexões</li>
              <li>Calcula modularidade: &quot;há mais conexões dentro do grupo?&quot;</li>
              <li>Agrupa nós que se conectam mais entre si</li>
              <li>Resultado: muitas comunidades específicas</li>
            </ul>
            
            <div style={{ padding: '8px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', marginTop: '8px' }}>
              <strong style={{ color: '#e0e0e0' }}>Exemplo:</strong>
              <p style={{ marginTop: '4px', fontSize: '10px' }}>
                Se você tem 4 usuários em SP (todos conectados) e 5 em NY (todos conectados):
              </p>
              <ul style={{ marginLeft: '16px', marginTop: '4px', fontSize: '10px' }}>
                <li><strong>BFS/DFS:</strong> 1 comunidade (todos conectados)</li>
                <li><strong>Louvain:</strong> 2 comunidades (SP e NY separados por densidade)</li>
              </ul>
            </div>
            
            <p style={{ marginTop: '12px', fontSize: '10px', color: '#aaa' }}>
              📄 Veja <code>COMO_FUNCIONA.md</code> para explicação detalhada!
            </p>
          </div>
        </details>
      </div>
      </div>
    </>
  )
}

