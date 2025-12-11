'use client';

import { useState, useEffect } from 'react';
import styles from '../../components/demo.module.css';

interface Node {
  id: string;
  x: number;
  y: number;
  connections: string[];
}

export default function AlgorithmDemo() {
  const [algorithm, setAlgorithm] = useState<'bfs' | 'dfs'>('bfs');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1000);
  const [path, setPath] = useState<Array<{from: string, to: string}>>([]);
  const [activeEdge, setActiveEdge] = useState<{from: string, to: string} | null>(null);

  // Grafo de exemplo simples
  const nodes: Node[] = [
    { id: 'A', x: 250, y: 50, connections: ['B', 'C'] },
    { id: 'B', x: 150, y: 150, connections: ['A', 'D', 'E'] },
    { id: 'C', x: 350, y: 150, connections: ['A', 'F'] },
    { id: 'D', x: 50, y: 250, connections: ['B'] },
    { id: 'E', x: 150, y: 250, connections: ['B', 'G'] },
    { id: 'F', x: 350, y: 250, connections: ['C'] },
    { id: 'G', x: 150, y: 350, connections: ['E'] }
  ];

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  const runBFS = async (startNode: string) => {
    const visitedSet = new Set<string>();
    const queueArray = [startNode];
    const pathArray: Array<{from: string, to: string}> = [];
    const parentMap = new Map<string, string>();
    let step = 0;

    while (queueArray.length > 0) {
      const current = queueArray.shift()!;
      
      if (visitedSet.has(current)) continue;

      // Mostrar aresta sendo explorada
      if (parentMap.has(current)) {
        const parent = parentMap.get(current)!;
        setActiveEdge({ from: parent, to: current });
        await new Promise(resolve => setTimeout(resolve, speed / 3));
        setPath(prev => [...prev, { from: parent, to: current }]);
      }

      setCurrentNode(current);
      setQueue([...queueArray]);
      setCurrentStep(++step);
      await new Promise(resolve => setTimeout(resolve, speed));

      visitedSet.add(current);
      setVisited(new Set(visitedSet));

      const node = getNodeById(current);
      if (node) {
        for (const neighbor of node.connections) {
          if (!visitedSet.has(neighbor) && !queueArray.includes(neighbor)) {
            queueArray.push(neighbor);
            parentMap.set(neighbor, current);
            // Destacar aresta sendo adicionada
            setActiveEdge({ from: current, to: neighbor });
            await new Promise(resolve => setTimeout(resolve, speed / 4));
          }
        }
      }
      setQueue([...queueArray]);
      setActiveEdge(null);
      await new Promise(resolve => setTimeout(resolve, speed / 2));
    }

    setCurrentNode(null);
    setActiveEdge(null);
    setIsRunning(false);
  };

  const runDFS = async (startNode: string, visitedSet = new Set<string>(), step = 0, parent: string | null = null): Promise<number> => {
    if (visitedSet.has(startNode)) return step;

    // Mostrar aresta sendo explorada
    if (parent) {
      setActiveEdge({ from: parent, to: startNode });
      await new Promise(resolve => setTimeout(resolve, speed / 3));
      setPath(prev => [...prev, { from: parent, to: startNode }]);
    }

    setCurrentNode(startNode);
    setCurrentStep(++step);
    await new Promise(resolve => setTimeout(resolve, speed));

    visitedSet.add(startNode);
    setVisited(new Set(visitedSet));

    const node = getNodeById(startNode);
    if (node) {
      for (const neighbor of node.connections) {
        if (!visitedSet.has(neighbor)) {
          setActiveEdge({ from: startNode, to: neighbor });
          await new Promise(resolve => setTimeout(resolve, speed / 4));
          step = await runDFS(neighbor, visitedSet, step, startNode);
          setActiveEdge(null);
        }
      }
    }

    setActiveEdge(null);
    return step;
  };

  const startAlgorithm = async () => {
    setIsRunning(true);
    setVisited(new Set());
    setQueue([]);
    setCurrentStep(0);
    setCurrentNode(null);
    setPath([]);
    setActiveEdge(null);

    if (algorithm === 'bfs') {
      await runBFS('A');
    } else {
      await runDFS('A', new Set(), 0, null);
      setIsRunning(false);
    }
  };

  const reset = () => {
    setIsRunning(false);
    setVisited(new Set());
    setQueue([]);
    setCurrentStep(0);
    setCurrentNode(null);
    setPath([]);
    setActiveEdge(null);
  };

  // Função para verificar se uma aresta está no caminho
  const isEdgeInPath = (from: string, to: string) => {
    return path.some(p => 
      (p.from === from && p.to === to) || 
      (p.from === to && p.to === from)
    );
  };

  // Função para verificar se uma aresta está ativa
  const isEdgeActive = (from: string, to: string) => {
    return activeEdge && (
      (activeEdge.from === from && activeEdge.to === to) ||
      (activeEdge.from === to && activeEdge.to === from)
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Demonstração: BFS vs DFS</h1>
      
      <div className={styles.controls}>
        <div className={styles.algorithmSelector}>
          <button
            className={`${styles.algoButton} ${algorithm === 'bfs' ? styles.active : ''}`}
            onClick={() => { setAlgorithm('bfs'); reset(); }}
            disabled={isRunning}
          >
            BFS (Breadth-First Search)
          </button>
          <button
            className={`${styles.algoButton} ${algorithm === 'dfs' ? styles.active : ''}`}
            onClick={() => { setAlgorithm('dfs'); reset(); }}
            disabled={isRunning}
          >
            DFS (Depth-First Search)
          </button>
        </div>

        <div className={styles.speedControl}>
          <label>Velocidade:</label>
          <input
            type="range"
            min="200"
            max="2000"
            step="200"
            value={2200 - speed}
            onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
            disabled={isRunning}
          />
          <span>{speed === 200 ? 'Rápido' : speed === 1000 ? 'Médio' : 'Lento'}</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.startButton}
            onClick={startAlgorithm}
            disabled={isRunning}
          >
            ▶ Iniciar
          </button>
          <button
            className={styles.resetButton}
            onClick={reset}
          >
            ⟲ Reiniciar
          </button>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.infoBox}>
          <h3>{algorithm === 'bfs' ? 'BFS - Busca em Largura' : 'DFS - Busca em Profundidade'}</h3>
          <p className={styles.description}>
            {algorithm === 'bfs' 
              ? 'Explora todos os vizinhos de um nó antes de avançar para o próximo nível. Usa uma FILA (FIFO).'
              : 'Explora o máximo possível em uma direção antes de retroceder. Usa uma PILHA (LIFO).'}
          </p>
          <div className={styles.stats}>
            <div>Passo: <strong>{currentStep}</strong></div>
            <div>Nó Atual: <strong>{currentNode || '-'}</strong></div>
            <div>Visitados: <strong>{visited.size}</strong></div>
            {algorithm === 'bfs' && <div>Fila: <strong>[{queue.join(', ')}]</strong></div>}
          </div>
        </div>
      </div>

      <svg className={styles.graph} viewBox="0 0 500 400">
        {/* Desenhar conexões de fundo (todas as arestas) */}
        {nodes.map(node => 
          node.connections.map(connId => {
            const target = getNodeById(connId);
            if (!target) return null;
            // Evitar desenhar linha duplicada
            if (node.id > connId) return null;
            const inPath = isEdgeInPath(node.id, connId);
            const isActive = isEdgeActive(node.id, connId);
            return (
              <line
                key={`${node.id}-${connId}`}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                className={`${styles.edge} ${
                  isActive ? styles.edgeActive : ''
                } ${
                  inPath ? styles.edgeInPath : ''
                }`}
              />
            );
          })
        )}

        {/* Desenhar nós */}
        {nodes.map(node => (
          <g key={node.id}>
            {/* Glow effect para nó atual */}
            {currentNode === node.id && (
              <circle
                cx={node.x}
                cy={node.y}
                r={40}
                className={styles.nodeGlow}
              />
            )}
            <circle
              cx={node.x}
              cy={node.y}
              r={30}
              className={`${styles.node} ${
                visited.has(node.id) ? styles.visited : ''
              } ${
                currentNode === node.id ? styles.current : ''
              } ${
                queue.includes(node.id) ? styles.inQueue : ''
              }`}
            />
            <text
              x={node.x}
              y={node.y}
              className={styles.nodeLabel}
            >
              {node.id}
            </text>
          </g>
        ))}
      </svg>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendCircle} ${styles.unvisited}`}></div>
          <span>Não visitado</span>
        </div>
        {algorithm === 'bfs' && (
          <div className={styles.legendItem}>
            <div className={`${styles.legendCircle} ${styles.inQueue}`}></div>
            <span>Na fila</span>
          </div>
        )}
        <div className={styles.legendItem}>
          <div className={`${styles.legendCircle} ${styles.current}`}></div>
          <span>Atual</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendCircle} ${styles.visited}`}></div>
          <span>Visitado</span>
        </div>
      </div>

      <div className={styles.explanation}>
        <h3>Como Funciona:</h3>
        {algorithm === 'bfs' ? (
          <ol>
            <li><strong>Início:</strong> Começa no nó A e adiciona à fila</li>
            <li><strong>Processar:</strong> Remove o primeiro da fila e marca como visitado</li>
            <li><strong>Adicionar vizinhos:</strong> Adiciona todos os vizinhos não visitados ao final da fila</li>
            <li><strong>Repetir:</strong> Processa o próximo da fila até que esteja vazia</li>
            <li><strong>Resultado:</strong> Visita nós por níveis (A → B,C → D,E,F → G)</li>
          </ol>
        ) : (
          <ol>
            <li><strong>Início:</strong> Começa no nó A</li>
            <li><strong>Mergulhar:</strong> Escolhe um vizinho e vai o mais fundo possível</li>
            <li><strong>Retroceder:</strong> Quando não há mais vizinhos não visitados, volta</li>
            <li><strong>Repetir:</strong> Continua até visitar todos os nós alcançáveis</li>
            <li><strong>Resultado:</strong> Explora um caminho completo antes de tentar outros</li>
          </ol>
        )}
      </div>
    </div>
  );
}
