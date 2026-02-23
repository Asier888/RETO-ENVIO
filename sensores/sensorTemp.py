import paho.mqtt.client as mqtt
import ssl
import time
import random

BROKER = "broker"
PORT = 8883
TOPIC = "sensores/temperatura"
CLIENT_ID = "sensor-temperatura"

CA_CERT = "/app/certs/ca.crt"
CLIENT_CERT = "/app/certs/temp.crt"
CLIENT_KEY = "/app/certs/temp.key"

INTERVALO = 3


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Sensor de temperatura conectado")
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
        temperatura = round(random.uniform(18.0, 30.0), 2)
        client.publish(TOPIC, temperatura)
        print(f"Temperatura enviada: {temperatura} °C")
        time.sleep(INTERVALO)

except KeyboardInterrupt:
    print("Sensor de temperatura detenido")

finally:
    client.loop_stop()
    client.disconnect()