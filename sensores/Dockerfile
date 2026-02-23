FROM python:3.11-slim

WORKDIR /app

# Librería MQTT
RUN pip install paho-mqtt

# Copiar sensores y certificados
COPY *.py /app/
COPY certs /app/certs

CMD ["python", "sensorTemp.py"]