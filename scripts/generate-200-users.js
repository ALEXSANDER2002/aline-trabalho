const fs = require('fs');

const names = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Hugo', 'Isabela', 'João', 'Kamila', 'Lucas', 'Mariana', 'Nicolas', 'Olivia', 'Pedro', 'Quésia', 'Rafael', 'Sofia', 'Thiago', 'Ursula', 'Vitor', 'Wagner', 'Xuxa', 'Yasmin', 'Zé', 'Amanda', 'Bernardo', 'Cecília', 'Daniel', 'Eduarda', 'Fábio', 'Giovana', 'Henrique', 'Iris', 'Júlio', 'Kelly', 'Leonardo', 'Melissa', 'Nathan', 'Otávio', 'Patrícia', 'Quintino', 'Roberta', 'Samuel', 'Tatiana', 'Ulisses', 'Valentina', 'William', 'Ximena', 'Yuri', 'Zilda', 'André', 'Beatriz', 'Carlos', 'Daniela', 'Emerson', 'Fernanda', 'Gustavo', 'Helena', 'Igor', 'Juliana', 'Kauã', 'Larissa', 'Marcelo', 'Natália', 'Orlando', 'Paula', 'Quirino', 'Renata', 'Sérgio', 'Tânia', 'Ulrich', 'Vanessa', 'Wesley', 'Yago', 'Alberto', 'Bruna', 'Cristiano', 'Débora', 'Elias', 'Flávia', 'Gabriel', 'Heloísa', 'Ícaro', 'Joana', 'Kleber', 'Lívia', 'Maurício', 'Nídia', 'Oscar', 'Priscila', 'Ricardo', 'Silvia', 'Teodoro', 'Úrsula', 'Vicente', 'Wanda', 'Xavier', 'Yara', 'Zacarias', 'Alice', 'Bento', 'Clara', 'Douglas', 'Estela', 'Fernando', 'Gisele', 'Humberto', 'Inês', 'Jorge', 'Karina', 'Lauro', 'Mônica', 'Nelson', 'Olga', 'Paulo', 'Quitéria', 'Rodrigo', 'Sílvio', 'Tereza', 'Ubiratan', 'Vera', 'Walter', 'Yvone', 'Zenaide', 'Ademar', 'Bianca', 'Caio', 'Denise', 'Evandro', 'Fátima', 'Gilberto', 'Hilda', 'Ivan', 'Jéssica', 'Klaus', 'Lúcia', 'Márcio', 'Nair', 'Osmar', 'Penélope', 'Quintiliano', 'Rosa', 'Sebastião', 'Telma', 'Urbano', 'Vitória', 'Wilson', 'Yolanda', 'Zaíra', 'Adriano', 'Bárbara', 'César', 'Dora', 'Ernesto', 'Flora', 'Geraldo', 'Horácio', 'Ilda', 'Jacó', 'Kátia', 'Léo', 'Marta', 'Nuno', 'Olívia', 'Pietro', 'Raquel', 'Simone', 'Tales', 'Valdeci', 'Willian', 'Yeda', 'Armando', 'Berenice', 'Cláudio', 'Dulce', 'Edgar', 'Fiona', 'Genival', 'Hortência'];

const cities = [
  // América do Sul
  {name: 'São Paulo', lat: -23.5505, lon: -46.6333},
  {name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729},
  {name: 'Buenos Aires', lat: -34.6037, lon: -58.3816},
  {name: 'Lima', lat: -12.0464, lon: -77.0428},
  {name: 'Bogotá', lat: 4.7110, lon: -74.0721},
  {name: 'Santiago', lat: -33.4489, lon: -70.6693},
  {name: 'Caracas', lat: 10.4806, lon: -66.9036},
  {name: 'Brasília', lat: -15.7942, lon: -47.8822},
  {name: 'Salvador', lat: -12.9714, lon: -38.5014},
  {name: 'Manaus', lat: -3.1190, lon: -60.0217},
  
  // América do Norte
  {name: 'Nova York', lat: 40.7128, lon: -74.0060},
  {name: 'Los Angeles', lat: 34.0522, lon: -118.2437},
  {name: 'Chicago', lat: 41.8781, lon: -87.6298},
  {name: 'Toronto', lat: 43.6532, lon: -79.3832},
  {name: 'Cidade do México', lat: 19.4326, lon: -99.1332},
  {name: 'Miami', lat: 25.7617, lon: -80.1918},
  {name: 'Vancouver', lat: 49.2827, lon: -123.1207},
  {name: 'San Francisco', lat: 37.7749, lon: -122.4194},
  
  // Europa
  {name: 'Londres', lat: 51.5074, lon: -0.1278},
  {name: 'Paris', lat: 48.8566, lon: 2.3522},
  {name: 'Berlim', lat: 52.5200, lon: 13.4050},
  {name: 'Madrid', lat: 40.4168, lon: -3.7038},
  {name: 'Roma', lat: 41.9028, lon: 12.4964},
  {name: 'Amsterdã', lat: 52.3676, lon: 4.9041},
  {name: 'Barcelona', lat: 41.3851, lon: 2.1734},
  {name: 'Moscou', lat: 55.7558, lon: 37.6173},
  {name: 'Lisboa', lat: 38.7223, lon: -9.1393},
  {name: 'Viena', lat: 48.2082, lon: 16.3738},
  
  // Ásia
  {name: 'Tóquio', lat: 35.6762, lon: 139.6503},
  {name: 'Pequim', lat: 39.9042, lon: 116.4074},
  {name: 'Xangai', lat: 31.2304, lon: 121.4737},
  {name: 'Mumbai', lat: 19.0760, lon: 72.8777},
  {name: 'Seul', lat: 37.5665, lon: 126.9780},
  {name: 'Bangkok', lat: 13.7563, lon: 100.5018},
  {name: 'Singapura', lat: 1.3521, lon: 103.8198},
  {name: 'Dubai', lat: 25.2048, lon: 55.2708},
  {name: 'Hong Kong', lat: 22.3193, lon: 114.1694},
  {name: 'Delhi', lat: 28.7041, lon: 77.1025},
  
  // Oceania
  {name: 'Sydney', lat: -33.8688, lon: 151.2093},
  {name: 'Melbourne', lat: -37.8136, lon: 144.9631},
  {name: 'Auckland', lat: -36.8485, lon: 174.7633},
  {name: 'Brisbane', lat: -27.4698, lon: 153.0251},
  
  // África
  {name: 'Cairo', lat: 30.0444, lon: 31.2357},
  {name: 'Cidade do Cabo', lat: -33.9249, lon: 18.4241},
  {name: 'Lagos', lat: 6.5244, lon: 3.3792},
  {name: 'Nairóbi', lat: -1.2921, lon: 36.8219},
  {name: 'Joanesburgo', lat: -26.2041, lon: 28.0473},
  {name: 'Casablanca', lat: 33.5731, lon: -7.5898}
];

const nodes = [];
const edges = [];

// Gerar 40 usuários em 4 comunidades, cada usuário em uma cidade real diferente
const communities = [
  { 
    name: 'América do Sul', 
    cities: [
      {name: 'São Paulo', lat: -23.5505, lon: -46.6333},
      {name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729},
      {name: 'Buenos Aires', lat: -34.6037, lon: -58.3816},
      {name: 'Lima', lat: -12.0464, lon: -77.0428},
      {name: 'Bogotá', lat: 4.7110, lon: -74.0721},
      {name: 'Santiago', lat: -33.4489, lon: -70.6693},
      {name: 'Caracas', lat: 10.4806, lon: -66.9036},
      {name: 'Brasília', lat: -15.7942, lon: -47.8822},
      {name: 'Salvador', lat: -12.9714, lon: -38.5014},
      {name: 'Manaus', lat: -3.1190, lon: -60.0217}
    ]
  },
  { 
    name: 'América do Norte',
    cities: [
      {name: 'Nova York', lat: 40.7128, lon: -74.0060},
      {name: 'Los Angeles', lat: 34.0522, lon: -118.2437},
      {name: 'Chicago', lat: 41.8781, lon: -87.6298},
      {name: 'Toronto', lat: 43.6532, lon: -79.3832},
      {name: 'Cidade do México', lat: 19.4326, lon: -99.1332},
      {name: 'Miami', lat: 25.7617, lon: -80.1918},
      {name: 'Vancouver', lat: 49.2827, lon: -123.1207},
      {name: 'San Francisco', lat: 37.7749, lon: -122.4194},
      {name: 'Houston', lat: 29.7604, lon: -95.3698},
      {name: 'Montreal', lat: 45.5017, lon: -73.5673}
    ]
  },
  { 
    name: 'Europa',
    cities: [
      {name: 'Londres', lat: 51.5074, lon: -0.1278},
      {name: 'Paris', lat: 48.8566, lon: 2.3522},
      {name: 'Berlim', lat: 52.5200, lon: 13.4050},
      {name: 'Madrid', lat: 40.4168, lon: -3.7038},
      {name: 'Roma', lat: 41.9028, lon: 12.4964},
      {name: 'Amsterdã', lat: 52.3676, lon: 4.9041},
      {name: 'Barcelona', lat: 41.3851, lon: 2.1734},
      {name: 'Moscou', lat: 55.7558, lon: 37.6173},
      {name: 'Lisboa', lat: 38.7223, lon: -9.1393},
      {name: 'Viena', lat: 48.2082, lon: 16.3738}
    ]
  },
  { 
    name: 'Ásia',
    cities: [
      {name: 'Tóquio', lat: 35.6762, lon: 139.6503},
      {name: 'Pequim', lat: 39.9042, lon: 116.4074},
      {name: 'Xangai', lat: 31.2304, lon: 121.4737},
      {name: 'Mumbai', lat: 19.0760, lon: 72.8777},
      {name: 'Seul', lat: 37.5665, lon: 126.9780},
      {name: 'Bangkok', lat: 13.7563, lon: 100.5018},
      {name: 'Singapura', lat: 1.3521, lon: 103.8198},
      {name: 'Dubai', lat: 25.2048, lon: 55.2708},
      {name: 'Hong Kong', lat: 22.3193, lon: 114.1694},
      {name: 'Delhi', lat: 28.7041, lon: 77.1025}
    ]
  }
];

let userIndex = 0;
communities.forEach((community, commIdx) => {
  community.cities.forEach((city, cityIdx) => {
    nodes.push({
      id: `user_${userIndex + 1}`,
      label: names[userIndex % names.length],
      lat: city.lat,
      lon: city.lon
    });
    userIndex++;
  });
});

// 4 comunidades de 10 usuários cada
const nodeRegions = nodes.map((node, idx) => {
  return Math.floor(idx / 10); // 10 usuários por região
});

// Garantir que todos tenham 2 conexões para redes mais densas
for (let i = 0; i < nodes.length; i++) {
  const numConnections = 2; // 2 conexões por usuário
  
  for (let j = 0; j < numConnections; j++) {
    let targetIdx;
    
    // 90% chance de conectar com alguém da mesma região
    if (Math.random() < 0.9) {
      const myRegion = nodeRegions[i];
      const sameRegionNodes = nodes.filter((_, idx) => nodeRegions[idx] === myRegion && idx !== i);
      if (sameRegionNodes.length > 0) {
        const targetNode = sameRegionNodes[Math.floor(Math.random() * sameRegionNodes.length)];
        targetIdx = nodes.findIndex(n => n.id === targetNode.id);
      }
    }
    
    // 10% conexão aleatória (inter-regional)
    if (targetIdx === undefined || targetIdx === i) {
      targetIdx = Math.floor(Math.random() * nodes.length);
    }
    
    if (targetIdx !== i && targetIdx < nodes.length && !edges.find(e => 
      (e.source === nodes[i].id && e.target === nodes[targetIdx].id) ||
      (e.source === nodes[targetIdx].id && e.target === nodes[i].id)
    )) {
      edges.push({
        source: nodes[i].id,
        target: nodes[targetIdx].id
      });
    }
  }
}

fs.writeFileSync('public/mock-users-data.json', JSON.stringify({nodes, edges}, null, 2));
console.log('40 usuários gerados com sucesso!');
