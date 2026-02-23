import paho.mqtt.client as mqtt
import ssl
import time
import random

# Configuración del broker
BROKER = "broker"
PORT = 8883
TOPIC = "sensores/vibracion"
CLIENT_ID = "s-vibracion"

CA_CERT = "/app/certs/ca.crt"
CLIENT_CERT = "/app/certs/vib.crt"
CLIENT_KEY = "/app/certs/vib.key"

INTERVALO = 2  # segundos


# =========================
# Callbacks
# =========================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Sensor de vibración conectado al broker seguro")
    else:
        print("Error de conexión:", rc)


# =========================
# Cliente MQTT
# =========================
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, client_id=CLIENT_ID)
client.on_connect = on_connect

client.tls_set(
    ca_certs=CA_CERT,
    certfile=CLIENT_CERT,
    keyfile=CLIENT_KEY,
    tls_version=ssl.PROTOCOL_TLS
)

client.connect(BROKER, PORT)
client.loop_start()

# =========================
# Simulación vibración 3 ejes
# =========================
try:
    while True:
        eje_x = round(random.uniform(-2.0, 2.0), 3)
        eje_y = round(random.uniform(-2.0, 2.0), 3)
        eje_z = round(random.uniform(-2.0, 2.0), 3)
        
        client.publish(TOPIC, str(eje_x) + "," + str(eje_y) + "," + str(eje_z))

        print(f"Vibración enviada: X={eje_x}g, Y={eje_y}g, Z={eje_z}g")

        time.sleep(INTERVALO)

except KeyboardInterrupt:
    print("Sensor de vibración detenido")

finally:
    client.loop_stop()
    client.disconnect()
    print("Sensor desconectado correctamente")