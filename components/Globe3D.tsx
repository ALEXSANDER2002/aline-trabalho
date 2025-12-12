'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useGraph } from '@/context/GraphContext'

// Tipos para WorldWind
declare global {
  interface Window {
    WorldWind: any
  }
}

// Gerar cores para comunidades (função auxiliar fora do componente)
const getCommunityColor = (communityId: number, hasCommunities: boolean = false) => {
  // Se não há comunidades detectadas, usar cor padrão (Azul vibrante)
  if (!hasCommunities || communityId === undefined || communityId === null) {
    return '#3b82f6'
  }

  // Paleta de cores moderna e vibrante (Tailwind-inspired)
  const colors = [
    '#ef4444', // red-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#6366f1', // indigo-500
    '#84cc16', // lime-500
    '#d946ef', // fuchsia-500
    '#14b8a6', // teal-500
    '#f43f5e', // rose-500
  ]
  return colors[communityId % colors.length]
}

export default function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wwdRef = useRef<any>(null)
  const { nodes = [], communities = {}, demoState } = useGraph()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [worldWindLoaded, setWorldWindLoaded] = useState(false)

  // Refs para armazenar valores atuais (para uso em closures)
  const nodesRef = useRef(nodes)
  const communitiesRef = useRef(communities)
  const demoStateRef = useRef(demoState || {
    isRunning: false,
    currentNode: null as string | null,
    visitedNodes: new Set<string>(),
    queue: [] as string[],
    distances: {} as Record<string, number>,
    step: 0
  })

  // Atualizar refs quando valores mudarem
  useEffect(() => {
    console.log('Globe3D: Atualizando refs:', { nodes: nodes.length, communities: Object.keys(communities).length })
    nodesRef.current = nodes
    communitiesRef.current = communities
    if (demoState) {
      demoStateRef.current = demoState
    }
  }, [nodes, communities, demoState])

  // Atualizar visualização quando demoState ou comunidades mudarem
  useEffect(() => {
    if (wwdRef.current && worldWindLoaded && nodes.length > 0) {
      const wwd = wwdRef.current as any
      if (wwd.updateNetworkVisualization) {
        console.log('Forçando atualização devido a mudança em communities ou demoState')
        // Forçar atualização
        requestAnimationFrame(() => {
          wwd.updateNetworkVisualization()
        })
      }
    }
  }, [communities, demoState, worldWindLoaded, nodes.length])

  // Forçar re-render adicional quando comunidades mudarem especificamente
  // Usar uma string JSON limitada como chave para detectar mudanças
  const communitiesKey = useMemo(() => {
    const keys = Object.keys(communities)
    if (keys.length === 0) return 'empty'
    // Criar uma chave baseada no tamanho e primeiros valores
    const sample = keys.slice(0, 20).map(k => `${k}:${communities[k]}`).join('|')
    return `${keys.length}-${sample}`
  }, [communities])

  useEffect(() => {
    const communitiesCount = Object.keys(communities).length
    
    if (communitiesCount > 0 && wwdRef.current && worldWindLoaded) {
      console.log('🔍 Comunidades detectadas:', communitiesCount, '- Forçando atualizações')
      
      // Atualizar refs primeiro
      nodesRef.current = nodes
      communitiesRef.current = communities
      if (demoState) {
        demoStateRef.current = demoState
      }
      
      const wwd = wwdRef.current as any
      if (wwd.updateNetworkVisualization) {
        // Forçar atualização imediata através de requestAnimationFrame duplo
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            console.log('✨ Forçando atualização imediata após detecção de comunidades')
            nodesRef.current = nodes
            communitiesRef.current = communities
            wwd.updateNetworkVisualization()
          })
        })
        
        // Múltiplas tentativas de atualização com delays progressivos para garantir
        setTimeout(() => {
          console.log('🔄 Forçando atualização 1/3')
          nodesRef.current = nodes
          communitiesRef.current = communities
          wwd.updateNetworkVisualization()
        }, 100)
        setTimeout(() => {
          console.log('🔄 Forçando atualização 2/3')
          nodesRef.current = nodes
          communitiesRef.current = communities
          wwd.updateNetworkVisualization()
        }, 300)
        setTimeout(() => {
          console.log('🔄 Forçando atualização 3/3')
          nodesRef.current = nodes
          communitiesRef.current = communities
          wwd.updateNetworkVisualization()
        }, 600)
      }
    }
  }, [communitiesKey, worldWindLoaded, nodes.length])

  // Redimensionar canvas quando a janela mudar de tamanho
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const width = canvasRef.current.offsetWidth || window.innerWidth
        const height = canvasRef.current.offsetHeight || window.innerHeight
        canvasRef.current.width = width
        canvasRef.current.height = height

        // Redimensionar WorldWind se já estiver inicializado
        if (wwdRef.current) {
          wwdRef.current.redraw()
        }
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Chamar uma vez para definir tamanho inicial

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Carregar WorldWind via CDN oficial da NASA
  useEffect(() => {
    if (worldWindLoaded) return

    // Função para verificar e carregar o WorldWind
    const loadWorldWind = () => {
      if (!canvasRef.current) {
        // Tentar novamente após um delay
        setTimeout(loadWorldWind, 100)
        return
      }

      // Garantir que o canvas tenha um ID e esteja no DOM
      if (canvasRef.current && !canvasRef.current.id) {
        canvasRef.current.id = 'worldwind-canvas'
      }

      // Verificar se o canvas está realmente no DOM
      if (!canvasRef.current.isConnected) {
        console.log('Aguardando canvas estar no DOM...')
        setTimeout(loadWorldWind, 100)
        return
      }

      // Verificar se o script já foi carregado
      if (document.querySelector('script[src*="worldwind"]')) {
        if (window.WorldWind && canvasRef.current) {
          setTimeout(() => initializeWorldWind(), 200)
          setWorldWindLoaded(true)
        }
        return
      }

      // CDN oficial da NASA WorldWind
      const script = document.createElement('script')
      script.src = 'https://files.worldwind.arc.nasa.gov/artifactory/web/0.9.0/worldwind.min.js'
      script.async = true

      script.onload = () => {
        // Aguardar o DOM estar completamente pronto
        const tryInitialize = () => {
          if (window.WorldWind && canvasRef.current) {
            // Verificar se o canvas está no DOM
            const canvasId = canvasRef.current.id || 'worldwind-canvas'
            if (!canvasRef.current.id) {
              canvasRef.current.id = canvasId
            }

            // Verificar se o canvas está realmente no DOM
            const canvasInDOM = document.getElementById(canvasId)
            if (canvasInDOM && canvasInDOM.isConnected) {
              requestAnimationFrame(() => {
                initializeWorldWind()
                setWorldWindLoaded(true)
              })
            } else {
              // Tentar novamente após um pequeno delay
              setTimeout(tryInitialize, 50)
            }
          }
        }

        // Aguardar um pouco e tentar inicializar
        setTimeout(tryInitialize, 100)
      }

      script.onerror = () => {
        console.error('Erro ao carregar WorldWind do CDN oficial')
        // Tentar CDN alternativo
        const altScript = document.createElement('script')
        altScript.src = 'https://cdn.jsdelivr.net/gh/NASAWorldWind/WebWorldWind@v0.9.0/build/worldwind.min.js'
        altScript.async = true
        altScript.onload = () => {
          // Aguardar o DOM estar completamente pronto
          const tryInitialize = () => {
            if (window.WorldWind && canvasRef.current) {
              // Verificar se o canvas está no DOM
              const canvasId = canvasRef.current.id || 'worldwind-canvas'
              if (!canvasRef.current.id) {
                canvasRef.current.id = canvasId
              }

              // Verificar se o canvas está realmente no DOM
              const canvasInDOM = document.getElementById(canvasId)
              if (canvasInDOM && canvasInDOM.isConnected) {
                requestAnimationFrame(() => {
                  initializeWorldWind()
                  setWorldWindLoaded(true)
                })
              } else {
                // Tentar novamente após um pequeno delay
                setTimeout(tryInitialize, 50)
              }
            }
          }

          // Aguardar um pouco e tentar inicializar
          setTimeout(tryInitialize, 100)
        }
        altScript.onerror = () => {
          console.error('Erro ao carregar WorldWind de CDN alternativo')
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d')
            if (ctx) {
              ctx.fillStyle = '#000'
              ctx.fillRect(0, 0, canvasRef.current.width || 800, canvasRef.current.height || 600)
              ctx.fillStyle = '#fff'
              ctx.font = '20px Arial'
              ctx.fillText('Erro ao carregar NASA WorldWind', 50, 50)
              ctx.fillText('Verifique sua conexão com a internet', 50, 80)
            }
          }
        }
        document.head.appendChild(altScript)
      }

      document.head.appendChild(script)
    }

    // Aguardar o próximo frame para garantir que o canvas foi renderizado
    requestAnimationFrame(() => {
      loadWorldWind()
    })

    return () => {
      // Limpar scripts ao desmontar
      const scripts = document.querySelectorAll('script[src*="worldwind"]')
      scripts.forEach(s => s.remove())
    }
  }, [worldWindLoaded])

  const initializeWorldWind = useCallback(() => {
    // Verificações mais rigorosas
    if (!canvasRef.current || !window.WorldWind) {
      console.error('Canvas ou WorldWind não disponível')
      return
    }

    // Verificar se o canvas está no DOM
    if (!canvasRef.current.isConnected) {
      console.error('Canvas não está no DOM')
      return
    }

    // Verificar se já foi inicializado
    if (wwdRef.current) {
      console.log('WorldWind já foi inicializado')
      return
    }

    try {
      const WorldWind = window.WorldWind

      // Garantir que o canvas tenha dimensões
      if (!canvasRef.current.width || !canvasRef.current.height) {
        canvasRef.current.width = canvasRef.current.offsetWidth || 800
        canvasRef.current.height = canvasRef.current.offsetHeight || 600
      }

      // Garantir que o canvas tenha ID
      if (!canvasRef.current.id) {
        canvasRef.current.id = 'worldwind-canvas'
      }

      // Verificar se o canvas está realmente no DOM usando querySelector
      const canvasInDOM = document.getElementById('worldwind-canvas')
      if (!canvasInDOM) {
        console.error('Canvas não encontrado no DOM pelo ID')
        return
      }

      // Criar WorldWindow - tentar com ID primeiro, depois com elemento
      let wwd
      try {
        // Tentar com ID como string
        wwd = new WorldWind.WorldWindow('worldwind-canvas')
      } catch (e) {
        // Se falhar, tentar com elemento
        try {
          wwd = new WorldWind.WorldWindow(canvasRef.current)
        } catch (e2) {
          console.error('Erro ao criar WorldWindow:', e2)
          throw e2
        }
      }
      wwdRef.current = wwd

        // Expor instância globalmente para controles externos
        ; (window as any).wwdInstance = wwd

      // Adicionar camadas do globo
      const bmngLayer = new WorldWind.BMNGLayer() // Blue Marble - textura da Terra
      bmngLayer.enabled = true // Habilitar para mostrar o mapa real

      const landsatLayer = new WorldWind.BMNGLandsatLayer() // Landsat
      landsatLayer.enabled = true // Habilitar para mostrar detalhes

      const layers = [
        bmngLayer,
        landsatLayer,
        new WorldWind.StarFieldLayer(), // Estrelas
        new WorldWind.AtmosphereLayer(), // Atmosfera
        new WorldWind.CompassLayer(), // Bússola
        new WorldWind.CoordinatesDisplayLayer(wwd), // Coordenadas
        new WorldWind.ViewControlsLayer(wwd) // Controles de navegação
      ]

      layers.forEach(layer => wwd.addLayer(layer))

      // Configurar câmera inicial - afastada para ver os grafos elevados
      wwd.navigator.lookAtLocation.latitude = -15 // América do Sul
      wwd.navigator.lookAtLocation.longitude = -50 // América do Sul
      wwd.navigator.range = 25e6 // 25 milhões de metros (vista afastada)

      // Forçar redraw inicial
      console.log('🌍 WorldWind inicializado! Forçando redraw inicial...')
      wwd.redraw()
      setTimeout(() => {
        console.log('🌍 Segundo redraw...')
        wwd.redraw()
      }, 100)
      setTimeout(() => {
        console.log('🌍 Terceiro redraw...')
        wwd.redraw()
      }, 500)

      // Criar layer para rede social (adicionar por último para ficar no topo)
      const networkLayer = new WorldWind.RenderableLayer('Social Network')
      networkLayer.enabled = true // Garantir que o layer está habilitado
      networkLayer.opacity = 1.0 // Garantir opacidade total
      networkLayer.displayName = 'Social Network'
      networkLayer.pickEnabled = true // Habilitar picking
      networkLayer.depthTest = false // Desabilitar teste de profundidade para sempre aparecer na frente

      // Adicionar o layer por último para ficar no topo
      wwd.addLayer(networkLayer)

      // Mover o layer para o topo da pilha
      const allLayers = wwd.layers
      const networkLayerIndex = allLayers.indexOf(networkLayer)
      if (networkLayerIndex !== -1 && networkLayerIndex !== allLayers.length - 1) {
        allLayers.splice(networkLayerIndex, 1)
        allLayers.push(networkLayer)
      }

      // Garantir que o layer seja renderizado
      console.log('NetworkLayer configurado:', {
        enabled: networkLayer.enabled,
        opacity: networkLayer.opacity,
        index: allLayers.indexOf(networkLayer),
        totalLayers: allLayers.length
      })

        // Armazenar referência do layer para uso posterior
        ; (wwd as any).networkLayer = networkLayer

      console.log('NetworkLayer criado e adicionado:', networkLayer.displayName)
      console.log('Total de layers:', wwd.layers.length)

      // Função para atualizar visualização (usa refs para valores atuais)
      const updateVisualization = () => {
        console.log('=== updateVisualization CHAMADO ===')
        if (!wwd || !networkLayer) {
          console.error('ERRO: WorldWind ou networkLayer não disponível', { wwd: !!wwd, networkLayer: !!networkLayer })
          return
        }

        // Obter valores atuais das refs (garantir que estamos usando os valores mais recentes)
        const currentNodes = nodesRef.current
        const currentCommunities = communitiesRef.current
        const hasCommunities = Object.keys(currentCommunities).length > 0
        
        console.log('Refs atuais:', { 
          nodesCount: currentNodes.length, 
          communitiesCount: Object.keys(currentCommunities).length,
          hasCommunities: hasCommunities,
          sampleCommunities: Object.entries(currentCommunities).slice(0, 5).map(([id, comm]) => `${id}:${comm}`)
        })

        // Limpar renderizáveis anteriores
        networkLayer.removeAllRenderables()

        console.log(`Atualizando visualização com ${currentNodes.length} nós`)

        if (currentNodes.length === 0) {
          console.log('Nenhum nó para renderizar')
          wwd.redraw()
          return
        }

        // Adicionar nós com Placemark
        let nodesAdded = 0
        console.log('Renderizando nós - Has communities?', hasCommunities, 'Total communities:', Object.keys(currentCommunities).length)
        currentNodes.forEach((node) => {
          const communityId = currentCommunities[node.id]
          const color = getCommunityColor(communityId, hasCommunities)
          
          // Log detalhado para debug
          if (nodesAdded < 5) {
            console.log(`🎨 Nó ${node.id}: communityId=${communityId}, color=${color}, hasCommunities=${hasCommunities}`)
          }

          // Criar Placemark com label
          const placemark = new WorldWind.Placemark(
            new WorldWind.Position(node.lat, node.lon, 0),
            false,
            null
          )

          const placemarkAttributes = new WorldWind.PlacemarkAttributes(null)

          // Configurar label
          placemarkAttributes.labelAttributes = new WorldWind.TextAttributes(null)
          placemarkAttributes.labelAttributes.color = WorldWind.Color.WHITE
          placemarkAttributes.labelAttributes.font = new WorldWind.Font(14, "bold")
          placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 0.2
          )
          placemarkAttributes.labelAttributes.depthTest = false

          placemark.label = node.label || node.id
          placemark.attributes = placemarkAttributes
          placemark.altitudeMode = WorldWind.CLAMP_TO_GROUND
          placemark.userProperties = { nodeId: node.id }

          networkLayer.addRenderable(placemark)

          // Adicionar efeito de brilho (Glow)
          const glow = new WorldWind.SurfaceCircle(
            new WorldWind.Location(node.lat, node.lon),
            150000, // Raio maior para o brilho
            new WorldWind.ShapeAttributes(null)
          )

          // Determinar cor e estilo baseado no estado (demonstração ou comunidade)
          const currentDemoState = demoStateRef.current
          let finalColor = color // SEMPRE usar a cor da comunidade como base
          let interiorOpacity = hasCommunities ? 0.9 : 0.85
          let outlineColor = new WorldWind.Color(0, 0, 0, 0) // Borda transparente por padrão
          let outlineWidth = 0
          let glowOpacity = hasCommunities ? 0.5 : 0.3
          let drawOutline = false
          
          // Aplicar indicadores visuais do demo mantendo as cores das comunidades
          if (currentDemoState && currentDemoState.isRunning) {
            if (currentDemoState.currentNode === node.id) {
              // Nó atual - manter cor da comunidade mas destacar com brilho e borda amarela
              interiorOpacity = 1.0
              outlineColor = new WorldWind.Color(1, 1, 0, 1) // Borda amarela brilhante (só durante demo)
              outlineWidth = 5
              drawOutline = true
              glowOpacity = 0.7
            } else if (currentDemoState.visitedNodes && currentDemoState.visitedNodes.has(node.id)) {
              // Nó visitado - manter cor da comunidade, adicionar borda verde sutil
              interiorOpacity = 0.95
              outlineColor = new WorldWind.Color(0.2, 0.8, 0.4, 0.8) // Borda verde clara (só durante demo)
              outlineWidth = 3
              drawOutline = true
              glowOpacity = 0.5
            } else if (currentDemoState.queue && currentDemoState.queue.includes(node.id)) {
              // Nó na fila - manter cor da comunidade, adicionar borda laranja
              interiorOpacity = 0.9
              outlineColor = new WorldWind.Color(1, 0.6, 0.2, 0.8) // Borda laranja (só durante demo)
              outlineWidth = 3
              drawOutline = true
              glowOpacity = 0.5
            } else {
              // Não visitado - manter cor da comunidade mas mais apagada, sem borda
              interiorOpacity = hasCommunities ? 0.6 : 0.4
              outlineWidth = 0
              drawOutline = false
              glowOpacity = 0.2
            }
          } else {
            // Quando não há demo rodando, mostrar comunidades sem borda
            if (hasCommunities) {
              interiorOpacity = 0.95 // Opacidade alta para cores vibrantes
              outlineWidth = 0 // Sem borda
              drawOutline = false
              glowOpacity = 0.5
            } else {
              // Sem comunidades - usar cor azul padrão, sem borda
              finalColor = '#3b82f6'
              interiorOpacity = 0.85
              outlineWidth = 0
              drawOutline = false
              glowOpacity = 0.3
            }
          }

          // Converter cor HEX para RGB (valores 0-1)
          let r = 0.2, g = 0.2, b = 0.2 // Default cinza escuro se falhar
          try {
            const hexColor = finalColor.replace('#', '')
            if (hexColor.length === 6) {
              r = parseInt(hexColor.substring(0, 2), 16) / 255
              g = parseInt(hexColor.substring(2, 4), 16) / 255
              b = parseInt(hexColor.substring(4, 6), 16) / 255
              
              if (nodesAdded < 3) {
                console.log(`   RGB: r=${r.toFixed(2)}, g=${g.toFixed(2)}, b=${b.toFixed(2)}, opacity=${interiorOpacity.toFixed(2)}`)
              }
            } else {
              console.warn(`Cor HEX inválida: ${finalColor}`)
            }
          } catch (e) {
            console.error('❌ Erro ao converter cor:', finalColor, e)
            // Usar método alternativo do WorldWind se disponível
            try {
              const circleColor = WorldWind.Color.colorFromHex(finalColor)
              r = circleColor.red
              g = circleColor.green
              b = circleColor.blue
            } catch (e2) {
              console.error('❌ Erro também no método WorldWind:', e2)
            }
          }

          // Configurar atributos do Glow
          const glowColor = new WorldWind.Color(r, g, b, glowOpacity)
          glow.attributes.interiorColor = glowColor
          glow.attributes.drawOutline = false
          glow.attributes.drawInterior = true
          glow.attributes.applyLighting = false

          networkLayer.addRenderable(glow)

          // Círculo Principal
          const circle = new WorldWind.SurfaceCircle(
            new WorldWind.Location(node.lat, node.lon),
            60000, // 60km de raio (menor que o glow)
            new WorldWind.ShapeAttributes(null)
          )

          const circleInteriorColor = new WorldWind.Color(r, g, b, interiorOpacity)
          circle.attributes.interiorColor = circleInteriorColor
          circle.attributes.outlineColor = outlineColor
          circle.attributes.outlineWidth = outlineWidth
          circle.attributes.drawInterior = true
          circle.attributes.drawOutline = drawOutline // Só desenhar borda se necessário (durante demo)
          circle.attributes.applyLighting = false

          // Log para verificar cores aplicadas
          if (nodesAdded < 3) {
            console.log(`   ✅ Círculo criado: cor=${finalColor}, RGB(${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)}), opacity=${interiorOpacity.toFixed(2)}`)
          }

          networkLayer.addRenderable(circle)

          nodesAdded++
        })

        // Redesenhar após adicionar todos os nós
        console.log(`Todos os ${nodesAdded} nós foram adicionados`)
        console.log(`Total de nós adicionados: ${nodesAdded}, renderables no layer: ${networkLayer.renderables.length}`)
        console.log('Tipos de renderables:', networkLayer.renderables.map((r: any) => r.constructor.name))
        console.log('Layer habilitado:', networkLayer.enabled, 'Opacidade:', networkLayer.opacity)

        // Adicionar conexões (linhas)
        let linesAdded = 0
        currentNodes.forEach((node, index) => {
          if (!node.connections || node.connections.length === 0) return
          // Validar coordenadas do nó origem
          if (typeof node.lat !== 'number' || typeof node.lon !== 'number' || 
              isNaN(node.lat) || isNaN(node.lon)) {
            console.warn(`Nó ${node.id} tem coordenadas inválidas: lat=${node.lat}, lon=${node.lon}`)
            return
          }

          node.connections.forEach((connectionId) => {
            const targetNodeIndex = currentNodes.findIndex((n) => n.id === connectionId)
            if (targetNodeIndex === -1) {
              console.warn(`Nó de destino não encontrado: ${connectionId}`)
              return
            }
            // Evitar desenhar linha duplicada (desenhar apenas quando targetIndex > index)
            if (targetNodeIndex <= index) return

            const targetNode = currentNodes[targetNodeIndex]
            if (!targetNode) {
              console.warn(`Nó de destino é null: ${connectionId}`)
              return
            }
            // Validar coordenadas do nó destino
            if (typeof targetNode.lat !== 'number' || typeof targetNode.lon !== 'number' ||
                isNaN(targetNode.lat) || isNaN(targetNode.lon)) {
              console.warn(`Nó destino ${connectionId} tem coordenadas inválidas: lat=${targetNode.lat}, lon=${targetNode.lon}`)
              return
            }

            const sourceCommunityId = currentCommunities[node.id]
            const targetCommunityId = currentCommunities[targetNode.id]
            const sameCommunity = hasCommunities && 
                                 sourceCommunityId !== undefined && 
                                 targetCommunityId !== undefined &&
                                 sourceCommunityId === targetCommunityId

            // Determinar cor da linha
            let lineColorHex: string
            let lineOpacity: number
            let lineWidth: number

            if (hasCommunities && sourceCommunityId !== undefined && targetCommunityId !== undefined) {
              if (sameCommunity) {
                // Conexão dentro da mesma comunidade - usar cor da comunidade mais vibrante
                lineColorHex = getCommunityColor(sourceCommunityId, true)
                lineOpacity = 0.75 // Opaco para destacar conexões dentro da comunidade
                lineWidth = 3.5 // Linha mais grossa
              } else {
                // Conexão entre comunidades diferentes - usar cor neutra clara (não preta!)
                lineColorHex = '#94a3b8' // slate-400 (cinza claro, não preto)
                lineOpacity = 0.4 // Opacidade mínima garantida para visibilidade
                lineWidth = 2 // Linha um pouco mais grossa para visibilidade
              }
            } else {
              // Sem comunidades detectadas ou nós sem comunidade - usar cor padrão
              lineColorHex = '#3b82f6' // blue-500 (azul, não preto)
              lineOpacity = 0.6
              lineWidth = 2.5
            }

            // Criar SurfacePolyline para conexão
            const surfaceLine = new WorldWind.SurfacePolyline(
              [
                new WorldWind.Location(node.lat, node.lon),
                new WorldWind.Location(targetNode.lat, targetNode.lon)
              ],
              new WorldWind.ShapeAttributes(null)
            )

            // Converter cor HEX para RGB manualmente (mesmo método dos círculos)
            let lineR = 0.6, lineG = 0.6, lineB = 0.6 // Default cinza claro se falhar (não preto!)
            try {
              const hexColor = lineColorHex.replace('#', '')
              if (hexColor.length === 6) {
                lineR = parseInt(hexColor.substring(0, 2), 16) / 255
                lineG = parseInt(hexColor.substring(2, 4), 16) / 255
                lineB = parseInt(hexColor.substring(4, 6), 16) / 255
                
                // Validar que não temos valores inválidos ou muito escuros (próximos de preto)
                if (isNaN(lineR) || isNaN(lineG) || isNaN(lineB)) {
                  console.warn(`Valores RGB inválidos para linha, usando cor padrão. HEX: ${lineColorHex}`)
                  lineR = 0.6
                  lineG = 0.6
                  lineB = 0.6
                }
              } else {
                console.warn(`Cor HEX de linha inválida: ${lineColorHex}, usando cor padrão`)
                // Tentar método do WorldWind como fallback
                try {
                  const lineColor = WorldWind.Color.colorFromHex(lineColorHex)
                  lineR = lineColor.red || 0.6
                  lineG = lineColor.green || 0.6
                  lineB = lineColor.blue || 0.6
                } catch (e) {
                  console.error('Erro ao converter cor da linha, usando cor padrão:', lineColorHex, e)
                  // Manter valores padrão (cinza claro)
                }
              }
            } catch (e) {
              console.error('Erro ao processar cor da linha, usando cor padrão:', lineColorHex, e)
              // Manter valores padrão (cinza claro)
            }
            
            // Garantir que valores RGB estão no range válido (0-1)
            lineR = Math.max(0, Math.min(1, lineR))
            lineG = Math.max(0, Math.min(1, lineG))
            lineB = Math.max(0, Math.min(1, lineB))

            surfaceLine.attributes.outlineColor = new WorldWind.Color(
              lineR,
              lineG,
              lineB,
              lineOpacity
            )
            surfaceLine.attributes.outlineWidth = lineWidth
            surfaceLine.attributes.drawInterior = false
            surfaceLine.attributes.drawOutline = true
            surfaceLine.attributes.applyLighting = false

            // Log para debug (primeiras 3 linhas)
            if (linesAdded < 3) {
              console.log(`   🔗 Linha ${node.id} -> ${targetNode.id}: cor=${lineColorHex}, RGB(${lineR.toFixed(2)}, ${lineG.toFixed(2)}, ${lineB.toFixed(2)}), opacity=${lineOpacity.toFixed(2)}, sameCommunity=${sameCommunity}`)
            }

            networkLayer.addRenderable(surfaceLine)
            linesAdded++
          })
        })

        console.log(`Linhas adicionadas: ${linesAdded}`)

        console.log(`Total de renderizáveis no layer: ${networkLayer.renderables.length}`)
        console.log(`Placemarks: ${networkLayer.renderables.filter((r: any) => r.constructor.name === 'Placemark').length}`)
        console.log(`Paths: ${networkLayer.renderables.filter((r: any) => r.constructor.name === 'Path').length}`)

        // Forçar redraw e garantir que o layer seja visível
        networkLayer.enabled = true
        networkLayer.opacity = 1.0

        // Garantir que o layer esteja no topo
        const allLayers = wwd.layers
        const layerIndex = allLayers.indexOf(networkLayer)
        if (layerIndex !== -1 && layerIndex !== allLayers.length - 1) {
          allLayers.splice(layerIndex, 1)
          allLayers.push(networkLayer)
        }

        console.log('Layer network position:', wwd.layers.indexOf(networkLayer), 'de', wwd.layers.length)
        console.log('Primeiros 3 renderables:', networkLayer.renderables.slice(0, 3).map((r: any) => ({
          type: r.constructor.name,
          enabled: r.enabled,
          position: r.position ? `${r.position.latitude}, ${r.position.longitude}` : 'N/A'
        })))

        // Forçar múltiplos redraws
        wwd.redraw()
        setTimeout(() => wwd.redraw(), 100)
        setTimeout(() => wwd.redraw(), 500)
        console.log('Redraws agendados. Renderizáveis no layer:', networkLayer.renderables.length)
      }

      // Atualizar visualização inicial se houver nós (usar refs)
      if (nodesRef.current.length > 0) {
        console.log('Inicializando com nós:', nodesRef.current.length)
        updateVisualization()
      } else {
        console.log('Aguardando nós serem carregados...')
      }

      // Listener para hover/clique
      wwd.addEventListener('click', (event: any) => {
        const pickList = wwd.pick(wwd.canvasCoordinates(event))
        if (pickList.objects.length > 0) {
          const pickedObject = pickList.objects[0].userObject
          if (pickedObject && pickedObject.userProperties && pickedObject.userProperties.nodeId) {
            setHoveredNode(pickedObject.userProperties.nodeId)
          }
        }
      })

        // Expor função de atualização para uso externo
        ; (wwd as any).updateNetworkVisualization = updateVisualization

      // Configurar intervalo para verificar e atualizar periodicamente
      const checkInterval = setInterval(() => {
        if (nodesRef.current.length > 0 && networkLayer.renderables.length === 0) {
          console.log('Detectados nós mas nenhum renderable - forçando atualização')
          updateVisualization()
        }
      }, 1000)

      // Limpar intervalo após 10 segundos
      setTimeout(() => clearInterval(checkInterval), 10000)

      // Atualizar visualização inicial após delays progressivos
      console.log('Agendando atualizações iniciais...')
      setTimeout(() => {
        console.log('Executando primeira atualização')
        updateVisualization()
      }, 500)
      setTimeout(() => {
        console.log('Executando segunda atualização')
        updateVisualization()
      }, 1500)
      setTimeout(() => {
        console.log('Executando terceira atualização')
        updateVisualization()
      }, 3000)
    } catch (error) {
      console.error('Erro ao inicializar WorldWind:', error)
    }
  }, [])

  // Atualizar visualização quando nodes ou communities mudarem
  useEffect(() => {
    console.log('useEffect de atualização chamado:', {
      worldWindLoaded,
      hasWwd: !!wwdRef.current,
      nodesCount: nodes.length,
      communitiesCount: Object.keys(communities).length,
      communitiesKeys: Object.keys(communities).slice(0, 5)
    })

    if (!worldWindLoaded || !wwdRef.current) {
      return
    }

    // Atualizar refs primeiro para garantir valores atuais
    nodesRef.current = nodes
    communitiesRef.current = communities
    if (demoState) {
      demoStateRef.current = demoState
    }

    const wwd = wwdRef.current as any

    // Usar a função de atualização exposta
    if (wwd.updateNetworkVisualization) {
      console.log(`Atualizando visualização: ${nodes.length} nós, ${Object.keys(communities).length} comunidades`)
      // Usar múltiplos requestAnimationFrame para garantir que a atualização aconteça
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wwd.updateNetworkVisualization()
        })
      })
    }
  }, [nodes, communities, hoveredNode, worldWindLoaded, demoState])

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, background: '#000' }}>
      <canvas
        ref={canvasRef}
        id="worldwind-canvas"
        width={800}
        height={600}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />
      {!worldWindLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(5px)',
          zIndex: 2000,
          color: '#fff'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <div style={{ fontSize: '18px', fontWeight: '500' }}>Carregando Globo 3D...</div>
          <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>Conectando aos servidores da NASA</div>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      {worldWindLoaded && nodes.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '24px 32px',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
          zIndex: 1000,
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>🌍</div>
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '8px', margin: 0 }}>
            Visualizador de Redes Sociais
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
            Carregue um arquivo JSON ou use o painel de controle para gerar uma rede de exemplo.
          </p>
        </div>
      )}

    </div>
  )
}
