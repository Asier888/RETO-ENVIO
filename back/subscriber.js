const mqtt = require('mqtt');
const fs = require('fs');

let io = null;
let db = null;

function initMQTT(socketServer, database) {
  io = socketServer;
  db = database;

  const options = {
    host: 'broker',
    port: 8883,
    protocol: 'mqtts',
    ca: fs.readFileSync('./certs/ca.crt'),
    cert: fs.readFileSync('./certs/client.crt'),
    key: fs.readFileSync('./certs/client.key'),
    rejectUnauthorized: true
  };

  const client = mqtt.connect(options);

  const latestData = { temperatura: null, humedad: null, vibracion: null };

  client.on('connect', () => {
    console.log('✅ Conectado al broker MQTT');
    client.subscribe('sensores/temperatura', { qos: 1 });
    client.subscribe('sensores/humedad', { qos: 1 });
    client.subscribe('sensores/vibracion', { qos: 1 });
  });

  client.on('message', (topic, message) => {
    try {
      const valor = parseFloat(message.toString());
      console.log('📩 Mensaje recibido en', topic, ':', valor);

      if (topic === 'sensores/temperatura') latestData.temperatura = valor;
      if (topic === 'sensores/humedad') latestData.humedad = valor;
      if (topic === 'sensores/vibracion') latestData.vibracion = valor;

      // Guardar en MySQL cuando tenemos los 3 valores
      if (latestData.temperatura !== null && latestData.humedad !== null && latestData.vibracion !== null) {
        const sql = 'INSERT INTO almacen (timestamp, temperatura, humedad, vibracion) VALUES (?, ?, ?, ?)';
        const values = [new Date(), latestData.temperatura, latestData.humedad, latestData.vibracion];

        db.query(sql, values, (err, results) => {
          if (err) console.error('❌ Error guardando en MySQL:', err);
          else console.log(`✅ Datos guardados: Temp=${latestData.temperatura}, Hum=${latestData.humedad}, Vib=${latestData.vibracion}`);

          // Emitir en tiempo real a frontend
          if (io) {
            io.emit('sensorData', { ...latestData, timestamp: new Date() });
          }

          // Reiniciar para el siguiente batch
          latestData.temperatura = null;
          latestData.humedad = null;
          latestData.vibracion = null;
        });
      }

    } catch (err) {
      console.error('❌ Error procesando mensaje:', err.message);
    }
  });

  client.on('error', (err) => {
    console.error('❌ Error MQTT:', err);
  });
}

module.exports = { initMQTT };