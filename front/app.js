// Conectar a WebSocket a través del proxy de nginx
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const socket = new WebSocket(protocol + '//' + window.location.host + '/ws');

const sensorsDiv = document.getElementById('sensors');

// Guardamos el último estado de cada sensor
let sensorData = {
  temperatura: null,
  humedad: null,
  vibracion_x: null,
  vibracion_y: null,
  vibracion_z: null,
  timestamp: null
};

socket.onopen = () => {
  console.log('🟢 Conectado al backend');
};

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.event === 'newData') {
    sensorData = msg.data;
    renderSensors();
  }
};

socket.onclose = () => {
  console.log('🔴 Desconectado del backend');
};

socket.onerror = (error) => {
  console.error('Error WebSocket:', error);
};

function renderSensors() {
  sensorsDiv.innerHTML = '';

  // Tarjeta de Temperatura
  if (sensorData.temperatura !== null) {
    const card = document.createElement('div');
    card.className = 'sensor temperatura-card';
    card.innerHTML = `
      <h2>🌡️ Temperatura</h2>
      <div class="value">${sensorData.temperatura.toFixed(2)} °C</div>
      <div class="timestamp">${new Date(sensorData.timestamp).toLocaleString('es-ES')}</div>
    `;
    sensorsDiv.appendChild(card);
  }

  // Tarjeta de Humedad
  if (sensorData.humedad !== null) {
    const card = document.createElement('div');
    card.className = 'sensor humedad-card';
    card.innerHTML = `
      <h2>💧 Humedad</h2>
      <div class="value">${sensorData.humedad.toFixed(2)} %</div>
      <div class="timestamp">${new Date(sensorData.timestamp).toLocaleString('es-ES')}</div>
    `;
    sensorsDiv.appendChild(card);
  }

  // Tarjeta de Vibración
  if (sensorData.vibracion_x !== null) {
    const card = document.createElement('div');
    card.className = 'sensor vibracion-card';
    card.innerHTML = `
      <h2>📊 Vibración</h2>
      <div class="value">X: ${sensorData.vibracion_x.toFixed(3)} m/s²</div>
      <div class="value">Y: ${sensorData.vibracion_y.toFixed(3)} m/s²</div>
      <div class="value">Z: ${sensorData.vibracion_z.toFixed(3)} m/s²</div>
      <div class="timestamp">${new Date(sensorData.timestamp).toLocaleString('es-ES')}</div>
    `;
    sensorsDiv.appendChild(card);
  }
}
