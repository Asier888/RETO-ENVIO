FROM eclipse-mosquitto:2.0

# Crear carpetas necesarias
RUN mkdir -p /mosquitto/certs /mosquitto/data

# Copiar configuración y certificados
COPY mosquitto.conf /mosquitto/config/mosquitto.conf
COPY certs /mosquitto/certs

EXPOSE 8883

CMD ["mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]