import paho.mqtt.client as mqtt
import ssl
import time
import random

BROKER = "broker"
PORT = 8883
TOPIC = "sensores/humedad"
CLIENT_ID = "sensor-humedad"

CA_CERT = "/app/certs/ca.crt"
CLIENT_CERT = "/app/certs/hum.crt"
CLIENT_KEY = "/app/certs/hum.key"

INTERVALO = 4


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Sensor de humedad conectado")
    else:
        print("Error de conexión:", rc)


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

try:
    while True:
        humedad = round(random.uniform(40.0, 80.0), 2)
        client.publish(TOPIC, humedad)
        print(f"Humedad enviada: {humedad} %")
        time.sleep(INTERVALO)

except KeyboardInterrupt:
    print("Sensor de humedad detenido")

finally:
    client.loop_stop()
    client.disconnect()