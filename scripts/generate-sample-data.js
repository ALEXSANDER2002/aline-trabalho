/**
 * Script para gerar dados de exemplo de rede social
 * Execute: node scripts/generate-sample-data.js
 */

const cities = [
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
  { name: 'Brasília', lat: -15.7942, lon: -47.8822 },
  { name: 'Salvador', lat: -12.9714, lon: -38.5014 },
  { name: 'Fortaleza', lat: -3.7172, lon: -38.5433 },
  { name: 'Belo Horizonte', lat: -19.9167, lon: -43.9345 },
  { name: 'Manaus', lat: -3.1190, lon: -60.0217 },
  { name: 'Curitiba', lat: -25.4284, lon: -49.2733 },
  { name: 'Recife', lat: -8.0476, lon: -34.8770 },
  { name: 'Porto Alegre', lat: -30.0346, lon: -51.2177 },
  { name: 'Belém', lat: -1.4558, lon: -48.5044 },
  { name: 'Goiânia', lat: -16.6864, lon: -49.2643 },
  { name: 'Guarulhos', lat: -23.4538, lon: -46.5331 },
  { name: 'Campinas', lat: -22.9056, lon: -47.0608 },
  { name: 'São Luís', lat: -2.5387, lon: -44.2825 }
]

function generateGraph(numNodes = 20, connectionProbability = 0.3) {
  const nodes = []
  const edges = []
  const nodeIds = []

  // Gerar nós
  for (let i = 0; i < numNodes && i < cities.length; i++) {
    const city = cities[i]
    const nodeId = `user${i + 1}`
    nodeIds.push(nodeId)
    nodes.push({
      id: nodeId,
      label: city.name,
      lat: city.lat + (Math.random() - 0.5) * 0.5, // Adicionar variação
      lon: city.lon + (Math.random() - 0.5) * 0.5
    })
  }

  // Gerar arestas (conexões)
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      if (Math.random() < connectionProbability) {
        edges.push({
          source: nodeIds[i],
          target: nodeIds[j]
        })
      }
    }
  }

  return { nodes, edges }
}

const graph = generateGraph(15, 0.25)
console.log(JSON.stringify(graph, null, 2))




