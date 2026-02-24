// server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const mqtt = require('mqtt');
const mysql = require('mysql2');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Conexión MySQL con reintentos
const dbConfig = {
  host: 'mysql',    // usar el nombre del servicio Docker-compose
  user: 'root',
  password: 'root',
  database: 'sensores'
};

let db;
function connectWithRetry(retries = 0) {
  db = mysql.createConnection(dbConfig);

  db.connect(err => {
    if (err) {
      const wait = Math.min(5000 + retries * 1000, 30000);
      console.error(`Error conectando a MySQL (intento ${retries + 1}):`, err.message || err);
      console.log(`Reintentando en ${wait} ms...`);
      setTimeout(() => connectWithRetry(retries + 1), wait);
      return;
    }
    console.log('Conectado a la base de datos MySQL');
  });
}

connectWithRetry();

// Cuando un cliente WebSocket se conecta
wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
});

// Función para emitir datos por WebSocket
const socketServer = {
  emit: (event, data) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event, data }));
      }
    });
  }
};

// Suscribirse a MQTT y guardar en MySQL
const mqttOptions = {
  host: 'broker',
  port: 8883,
  protocol: 'mqtts',
  ca: fs.readFileSync('./certs/ca.crt'),
  cert: fs.readFileSync('./certs/backend.crt'),
  key: fs.readFileSync('./certs/backend.key'),
  rejectUnauthorized: false
};

const client = mqtt.connect(mqttOptions);

const latestData = { temperatura: null, humedad: null, vibracion_x: null, vibracion_y: null, vibracion_z: null };

client.on('connect', () => {
  console.log('🔌 Conectado al broker MQTT con TLS');

  client.subscribe('sensores/temperatura');
  client.subscribe('sensores/humedad');
  client.subscribe('sensores/vibracion');
});

client.on('message', (topic, message) => {
  const mensajeStr = message.toString();

  if (topic === 'sensores/temperatura') latestData.temperatura = parseFloat(mensajeStr);
  if (topic === 'sensores/humedad') latestData.humedad = parseFloat(mensajeStr);
  if (topic === 'sensores/vibracion') {
    const valores = mensajeStr.split(',');
    latestData.vibracion_x = parseFloat(valores[0]);
    latestData.vibracion_y = parseFloat(valores[1]);
    latestData.vibracion_z = parseFloat(valores[2]);
  }

  // Guardar solo cuando tenemos los 3 valores
  if (latestData.temperatura !== null && latestData.humedad !== null && latestData.vibracion_x !== null) {
    const sql = 'INSERT INTO almacen (timestamp, temperatura, humedad, Xvibracion, Yvibracion, Zvibracion) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [new Date(), latestData.temperatura, latestData.humedad, latestData.vibracion_x, latestData.vibracion_y, latestData.vibracion_z];

    db.query(sql, values, (err, results) => {
      if (err) console.error('Error guardando en MySQL:', err);
      else console.log(`Datos guardados: Temp=${latestData.temperatura}, Hum=${latestData.humedad}, Vib_X=${latestData.vibracion_x}, Vib_Y=${latestData.vibracion_y}, Vib_Z=${latestData.vibracion_z}`);

      // Emitir por WebSocket al frontend
      socketServer.emit('newData', { ...latestData, timestamp: new Date() });

      // Reiniciar para el siguiente batch
      latestData.temperatura = null;
      latestData.humedad = null;
      latestData.vibracion_x = null;
      latestData.vibracion_y = null;
      latestData.vibracion_z = null;
    });
  }
});

// API REST para obtener todos los datos
app.get('/api/sensors', (req, res) => {
  db.query('SELECT * FROM almacen ORDER BY timestamp DESC LIMIT 100', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Arrancar servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});