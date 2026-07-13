# Sistema de Gestión de Clientes y Alquileres — HCT

Proyecto de microservicios desarrollado por **Marilyn Vilcapuma** (Valle Grande).
Sistema reactivo para la gestión de clientes y alquileres, desplegado en Kubernetes.

---

## 📐 Arquitectura

El sistema está compuesto por **3 microservicios independientes**, cada uno con su propia imagen Docker y sus propios manifiestos de Kubernetes (namespace, secret, deployment y service):

```
                        ┌──────────────────────────────────────────────┐
                        │        CLÚSTER KUBERNETES (Docker Desktop)   │
 Navegador              │                                              │
    │                   │  ┌─────────────────────────────────────┐    │
    │  :30080           │  │ ns: hct-frontend-vilcapuma-marilyn  │    │
    ├──────────────────►│  │  Pod: React + Vite (Nginx :80)      │    │
    │                   │  └─────────────────────────────────────┘    │
    │  :30091           │  ┌─────────────────────────────────────┐    │
    ├──────────────────►│  │ ns: hct-cliente-vilcapuma-marilyn   │    │      ┌──────────────┐
    │                   │  │  Pod: API Cliente (WebFlux :9091)   │────┼─────►│              │
    │  :30092           │  └─────────────────────────────────────┘    │      │  PostgreSQL  │
    └──────────────────►│  ┌─────────────────────────────────────┐    │      │  (Neon.tech) │
                        │  │ ns: hct-alquiler-vilcapuma-marilyn  │────┼─────►│              │
                        │  │  Pod: API Alquiler (WebFlux :9092)  │    │      └──────────────┘
                        │  └───────────────┬─────────────────────┘    │
                        │                  └──► llama al servicio     │
                        │                       cliente vía DNS       │
                        │                       interno del clúster   │
                        └──────────────────────────────────────────────┘
```

- Cada microservicio vive **aislado en su propio namespace**.
- Las credenciales de la base de datos van en **Secrets codificados en base64**.
- El microservicio de alquiler consume al de cliente por la red interna del clúster:
  `http://hct-cliente-svc.hct-cliente-vilcapuma-marilyn.svc.cluster.local:9091`
- La base de datos es PostgreSQL serverless en la nube (Neon), compartida por ambas APIs.

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend (cliente y alquiler) | Java 26 · Spring Boot 4.1 · WebFlux (reactivo) · R2DBC |
| Base de datos | PostgreSQL serverless (Neon.tech) |
| Frontend | React · Vite · servido con Nginx |
| Contenedores | Docker multi-etapa (Alpine + runtime jlink optimizado, imagen < 110 MB) |
| Registro de imágenes | DockerHub (`marilynvilcapuma/htc-*`) |
| Orquestación | Kubernetes (Docker Desktop) · manifiestos YAML |

## 📁 Estructura de manifiestos

Cada microservicio tiene su carpeta de manifiestos, numerados en el **orden en que Kubernetes debe aplicarlos**:

```
manifest-cliente/           (igual estructura en manifest-alquiler y manifest-frontend)
├── 01-...-namespace.yml    → crea el namespace (la "carpeta" aislada)
├── 02-...-secret.yml       → credenciales de BD en base64
├── 03-...-deployment.yml   → define el pod: imagen, puerto, variables, recursos
└── 04-...-service.yml      → expone el pod (NodePort)
```

## 🔌 Endpoints de la API de Cliente

Base: `http://localhost:30091/api/v1/clientes`

| Método | Ruta | Acción |
|---|---|---|
| GET | `/` | Listar todos los clientes |
| GET | `/{id}` | Buscar cliente por id |
| POST | `/` | Crear cliente (nace con estado **Activo**) |
| PUT | `/{id}` | Actualizar datos del cliente |
| PATCH | `/{id}/activar` | Cambiar estado a **Activo** |
| PATCH | `/{id}/desactivar` | Cambiar estado a **Inactivo** |
| DELETE | `/{id}` | Eliminar cliente |

> El campo `estado` se guarda como booleano en la BD pero la API lo muestra como texto (`Activo` / `Inactivo`). Al crear un cliente no se envía ni `id` ni `estado`: los genera el servidor.

---

# 🚀 Comandos para ejecutar el proyecto

## 1. Ejecución local (sin Docker)

```powershell
# Compilar y ejecutar el microservicio (desde la carpeta del proyecto)
.\mvnw.cmd spring-boot:run
```
> Levanta la aplicación en `http://localhost:9091` usando el Maven Wrapper (no necesitas Maven instalado).

```powershell
# Solo compilar y empaquetar el jar (sin ejecutar)
.\mvnw.cmd clean package -DskipTests

# Ejecutar el jar ya empaquetado
java -jar target\marilynvilcapuma-0.0.1-SNAPSHOT.jar
```
> `clean package` borra compilaciones previas y genera el jar en `target/`. Útil para verificar que el proyecto compila completo antes de dockerizar.

## 2. Construir y subir las imágenes Docker

```powershell
# Iniciar sesión en DockerHub (solo la primera vez)
docker login
```

```powershell
# CLIENTE (desde c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo\back-cliente)
docker build -t marilynvilcapuma/htc-cliente:latest .
docker push marilynvilcapuma/htc-cliente:latest
```
> `build` construye la imagen optimizada (multi-etapa con jlink) y `push` la sube a DockerHub para que Kubernetes pueda descargarla.

```powershell
# ALQUILER (desde c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo\back-alquiler)
docker build -t marilynvilcapuma/htc-alquiler:latest .
docker push marilynvilcapuma/htc-alquiler:latest
```

```powershell
# FRONTEND (desde c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo\frontend)
docker build -t marilynvilcapuma/htc-frontend:latest --build-arg VITE_CLIENTE_API=http://localhost:30091 --build-arg VITE_ALQUILER_API=http://localhost:30092 .
docker push marilynvilcapuma/htc-frontend:latest
```
> ⚠️ El frontend necesita los `--build-arg` porque Vite "hornea" las URLs de las APIs dentro del bundle **al construir la imagen**, no al ejecutarla.

```powershell
# Verificar las imágenes construidas y su peso
docker images
```

## 3. Desplegar en Kubernetes

```powershell
# Aplicar los manifiestos de cada microservicio (en orden 01→04 automático)
# Opción A: parada en la raíz del repositorio (una sola terminal, rutas cortas)
cd c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo
kubectl apply -f back-cliente/manifest-cliente/
kubectl apply -f back-alquiler/manifest-alquiler/
kubectl apply -f frontend/manifest-frontend/
```

```powershell
# Opción B: parada dentro de cada carpeta de microservicio (ruta relativa)
cd c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo\back-cliente
kubectl apply -f manifest-cliente/

cd c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo\back-alquiler
kubectl apply -f manifest-alquiler/

cd c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo\frontend
kubectl apply -f manifest-frontend/
```

```powershell
# Opción C: desde cualquier ubicación (ruta completa)
kubectl apply -f "c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo\back-cliente\manifest-cliente\"
kubectl apply -f "c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo\back-alquiler\manifest-alquiler\"
kubectl apply -f "c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo\frontend\manifest-frontend\"
```
> `apply -f <carpeta>` crea/actualiza todos los recursos de la carpeta en orden alfabético — por eso los archivos van numerados: namespace → secret → deployment → service. La ruta puede ser relativa (desde donde está tu terminal) o absoluta; también puedes aplicar un solo archivo, p. ej. `kubectl apply -f manifest-cliente\02-...-secret.yml`.

```powershell
# Esperar a que el despliegue termine (sale cuando el pod está listo)
kubectl rollout status deployment/hct-cliente-deployment -n hct-cliente-vilcapuma-marilyn
```

## 4. Validar que todo funciona

```powershell
# Ver TODO lo creado en cada namespace (pods, services, deployments)
kubectl get all -n hct-cliente-vilcapuma-marilyn
kubectl get all -n hct-alquiler-vilcapuma-marilyn
kubectl get all -n hct-frontend-vilcapuma-marilyn
```
> El pod debe estar `Running` y `READY 1/1`.

```powershell
# Verificar que los secrets se crearon
kubectl get secrets -n hct-cliente-vilcapuma-marilyn

# Ver los logs de la aplicación (confirma conexión a Neon y puerto)
kubectl logs -f deployment/hct-cliente-deployment -n hct-cliente-vilcapuma-marilyn
```
> Busca las líneas `Netty started on port 9091` y `Started ... Application`. Sal con `Ctrl+C`.

```powershell
# Exponer los servicios en localhost (una terminal por servicio, dejar abiertas)
kubectl port-forward svc/hct-cliente-svc  30091:9091 -n hct-cliente-vilcapuma-marilyn
kubectl port-forward svc/hct-alquiler-svc 30092:9092 -n hct-alquiler-vilcapuma-marilyn
kubectl port-forward svc/hct-frontend-svc 30080:80   -n hct-frontend-vilcapuma-marilyn
```
> ⚠️ Necesario porque el clúster "kind" de Docker Desktop no publica los NodePort directamente en localhost. Con esto ya puedes abrir:
> - API cliente → `http://localhost:30091/api/v1/clientes`
> - API alquiler → `http://localhost:30092/api/v1/alquileres`
> - Frontend → `http://localhost:30080`

## 5. Actualizar tras un cambio de código

El ciclo siempre es el mismo: **reconstruir → subir → reiniciar el deployment → verificar**. Solo hace falta hacerlo para el/los servicios que cambiaron.

```powershell
# CLIENTE (desde back-cliente)
docker build -t marilynvilcapuma/htc-cliente:latest .
docker push marilynvilcapuma/htc-cliente:latest
kubectl rollout restart deployment/hct-cliente-deployment -n hct-cliente-vilcapuma-marilyn
kubectl rollout status deployment/hct-cliente-deployment -n hct-cliente-vilcapuma-marilyn
```

```powershell
# ALQUILER (desde back-alquiler)
docker build -t marilynvilcapuma/htc-alquiler:latest .
docker push marilynvilcapuma/htc-alquiler:latest
kubectl rollout restart deployment/hct-alquiler-deployment -n hct-alquiler-vilcapuma-marilyn
kubectl rollout status deployment/hct-alquiler-deployment -n hct-alquiler-vilcapuma-marilyn
```

```powershell
# FRONTEND (desde frontend — no olvidar los --build-arg de Vite)
docker build -t marilynvilcapuma/htc-frontend:latest --build-arg VITE_CLIENTE_API=http://localhost:30091 --build-arg VITE_ALQUILER_API=http://localhost:30092 .
docker push marilynvilcapuma/htc-frontend:latest
kubectl rollout restart deployment/hct-frontend-deployment -n hct-frontend-vilcapuma-marilyn
kubectl rollout status deployment/hct-frontend-deployment -n hct-frontend-vilcapuma-marilyn
```

```powershell
# Confirmar que los pods nuevos quedaron corriendo (Running 1/1)
kubectl get pods -n hct-cliente-vilcapuma-marilyn
kubectl get pods -n hct-alquiler-vilcapuma-marilyn
kubectl get pods -n hct-frontend-vilcapuma-marilyn
```
> El `rollout restart` es necesario porque al usar siempre la etiqueta `:latest`, Kubernetes **no detecta solo** que la imagen cambió; el restart fuerza a recrear el pod y, gracias a `imagePullPolicy: Always`, descarga la versión nueva desde DockerHub. `rollout status` espera y confirma que el pod nuevo levantó bien.

### 💡 Buena práctica: versionar con tags en lugar de `:latest`

```powershell
# 1) Construir y subir con una versión explícita
docker build -t marilynvilcapuma/htc-frontend:v2 .
docker push marilynvilcapuma/htc-frontend:v2

# 2) Apuntar el deployment a la nueva versión (no hace falta rollout restart)
kubectl set image deployment/hct-frontend-deployment hct-frontend=marilynvilcapuma/htc-frontend:v2 -n hct-frontend-vilcapuma-marilyn

# 3) Si algo falla, volver a la versión anterior al instante
kubectl rollout undo deployment/hct-frontend-deployment -n hct-frontend-vilcapuma-marilyn
```
> Con tags versionados (`:v2`, `:v3`...) Kubernetes sí detecta el cambio de imagen y guarda el historial de versiones, lo que permite hacer *rollback* con `rollout undo` si la nueva versión sale mal.

---

# 🧯 Diagnóstico y eliminación si algo falla

## Diagnosticar

```powershell
# Estado de los pods (¿Running, ImagePullBackOff, CrashLoopBackOff?)
kubectl get pods -n hct-cliente-vilcapuma-marilyn

# Ver los EVENTOS del pod: aquí aparece la causa exacta del fallo
kubectl describe pod -l app=hct-cliente -n hct-cliente-vilcapuma-marilyn

# Logs del contenedor anterior (si el pod se reinicia en bucle)
kubectl logs -l app=hct-cliente -n hct-cliente-vilcapuma-marilyn --previous

# Verificar que el service encuentra al pod (si sale vacío, los labels no coinciden)
kubectl get endpoints -n hct-cliente-vilcapuma-marilyn
```

| Error | Causa típica | Solución |
|---|---|---|
| `ImagePullBackOff` | La imagen no existe en DockerHub o el nombre está mal | Revisar `image:` en el deployment y hacer `docker push` |
| `CrashLoopBackOff` | La app arranca y muere (casi siempre error de BD) | Ver logs; revisar valores del Secret |
| Pod `Running` pero URL no responde | NodePort no expuesto (clúster kind) o selector mal | Usar `kubectl port-forward`; revisar labels |

## Eliminar recursos

```powershell
# Eliminar TODO lo de un microservicio (respeta la carpeta = elimina sus 4 recursos)
kubectl delete -f "c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo\back-cliente\manifest-cliente\"
kubectl delete -f "c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo\back-alquiler\manifest-alquiler\"
kubectl delete -f "c:\Users\maril\Desktop\proyect\hct_as241_44_marilyn_vilcapumatrujillo\frontend\manifest-frontend\"
```
> Borra namespace, secret, deployment y service del microservicio. Es la forma limpia de "empezar de cero": después vuelves a ejecutar `kubectl apply -f`.

```powershell
# Alternativa: borrar solo el namespace (arrastra todo lo que contiene)
kubectl delete namespace hct-cliente-vilcapuma-marilyn

# Borrar solo un recurso puntual (ejemplos)
kubectl delete deployment hct-cliente-deployment -n hct-cliente-vilcapuma-marilyn
kubectl delete pod <nombre-del-pod> -n hct-cliente-vilcapuma-marilyn   # el deployment lo recrea solo
```

```powershell
# Volver a la versión anterior de un deployment (si la nueva imagen salió mal)
kubectl rollout undo deployment/hct-cliente-deployment -n hct-cliente-vilcapuma-marilyn
```

```powershell
# Limpiar imágenes Docker locales que ya no uses
docker rmi marilynvilcapuma/htc-cliente:latest   # borrar una imagen específica
docker image prune -f                             # borrar imágenes huérfanas (<none>)
docker ps -a                                      # listar contenedores (incluso detenidos)
docker rm -f <id-contenedor>                      # forzar borrado de un contenedor
```

---

## ✅ Orden correcto de ejecución (resumen)

1. `docker login` → autenticarse en DockerHub.
2. `docker build` + `docker push` de los 3 microservicios (frontend con `--build-arg`).
3. `kubectl apply -f` de las 3 carpetas de manifiestos.
4. `kubectl get all -n <namespace>` → esperar pods `Running 1/1`.
5. `kubectl port-forward` de los 3 services (terminales abiertas).
6. Probar en el navegador: `http://localhost:30080` (frontend) y las APIs en `30091` / `30092`.
