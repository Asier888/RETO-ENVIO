# 📡 Sistema IoT Seguro con MQTT, TLS y Docker

> **Reto:** MQTT SEGURO — Desarrollo de aplicaciones para IoT

## 👥 Miembros del equipo

| Nombre |
|--------|
| Alaia Yeregui |
| Asier Sánchez |

---

## 📖 Fases de desarrollo

### 1️⃣ Diseño de la arquitectura

Se definió una arquitectura basada en el modelo **Publicador–Suscriptor (Publish–Subscribe)** con los siguientes componentes:

- 🐍 Sensores en Python
- 📨 Broker MQTT (Eclipse Mosquitto)
- ⚙️ Backend en Node.js
- 🗄️ Base de datos MySQL
- 🌐 Frontend web
- 🐳 Orquestación mediante Docker Compose

---

### 2️⃣ Configuración del broker MQTT seguro

- Instalación de Eclipse Mosquitto
- Creación de una Autoridad Certificadora (CA) propia
- Generación de certificados para: Broker, Sensores y Backend
- Configuración de TLS en el puerto **8883**
- Activación de autenticación mutua (**mTLS**)
- Desactivación de conexiones anónimas

---

### 3️⃣ Desarrollo de los sensores

Se desarrollaron tres sensores simulados en Python:

| Sensor | Descripción |
|--------|-------------|
| 🌡️ Temperatura | Genera valores aleatorios de temperatura |
| 💧 Humedad | Genera valores aleatorios de humedad |
| 📳 Vibración | Genera valores tridimensionales (X, Y, Z) |

Cada sensor se conecta al broker mediante TLS y publica datos en su topic correspondiente.

---

### 4️⃣ Implementación del backend

El backend en Node.js:

- Se conecta al broker como **suscriptor**
- Se suscribe a los topics:
  - `sensores/temperatura`
  - `sensores/humedad`
  - `sensores/vibracion`
- Procesa los datos recibidos
- Inserta la información en la base de datos MySQL
- Envía actualizaciones al frontend mediante **WebSocket**

---

### 5️⃣ Configuración de la base de datos

- Base de datos: `sensores`
- Tabla: `almacen`

| Campo | Tipo |
|-------|------|
| timestamp | DATETIME |
| temperatura | FLOAT |
| humedad | FLOAT |
| vibracion_x | FLOAT |
| vibracion_y | FLOAT |
| vibracion_z | FLOAT |

---

### 6️⃣ Desarrollo del frontend

- Interfaz web sencilla con visualización en **tiempo real**
- Comunicación con el backend mediante WebSocket
- Despliegue con **Nginx**

---

### 7️⃣ Contenerización

- Dockerfiles individuales para cada servicio
- Orquestación completa con `docker-compose.yml`
- Pruebas de integración y validación del sistema completo

---

## ▶️ Instrucciones de uso

### Requisitos previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

### Ejecutar el sistema

Desde la carpeta raíz del proyecto:

```bash
docker compose up --build
```

### Ver logs del broker

```bash
docker compose logs broker
```

### Acceder al frontend

Abrir en el navegador:

```
http://localhost
```

> Si has mapeado otro puerto: `http://localhost:8080`

### Verificar datos en la base de datos

Acceder al contenedor MySQL:

```bash
docker compose exec mysql mysql -u root -p
```

Seleccionar la base de datos y consultar datos:

```sql
USE sensores;
SELECT * FROM almacen;
```

---

## 🚀 Posibles vías de mejora

- [ ] Implementar niveles de QoS en MQTT
- [ ] Configurar ACLs en el broker
- [ ] Renovación automática de certificados digitales
- [ ] Autenticación y autorización en la API REST
- [ ] Enviar datos en formato JSON estructurado
- [ ] Implementar detección de anomalías en vibración
- [ ] Añadir monitorización del sistema (Prometheus / Grafana)

---

## ⚠️ Problemas y retos encontrados

- Configuración inicial de certificados TLS y validación mTLS
- Errores de conexión por rutas incorrectas de certificados
- Problemas de sincronización entre servicios al iniciar Docker
- Gestión del formato de datos de vibración
- Errores SSL cuando los contenedores se detenían abruptamente
- Coordinación correcta entre MQTT y WebSocket en tiempo real

---

## 🔄 Alternativas consideradas

| Alternativa | En lugar de... |
|-------------|----------------|
| Usuario y contraseña | Certificados mTLS |
| HTTP / REST | MQTT |
| Broker MQTT en la nube | Broker local (Mosquitto) |
| Base de datos NoSQL / series temporales | MySQL |
| Polling HTTP en el frontend | WebSocket |
