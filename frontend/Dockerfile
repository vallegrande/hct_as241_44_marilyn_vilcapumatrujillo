# ============================================================
# Etapa 1: BUILD - compila la aplicacion React con Vite
# ============================================================
FROM node:22-alpine AS build
WORKDIR /app

# URLs de los microservicios (se fijan en tiempo de build)
ARG VITE_CLIENTE_API=http://localhost:9091
ARG VITE_ALQUILER_API=http://localhost:9092
ENV VITE_CLIENTE_API=$VITE_CLIENTE_API
ENV VITE_ALQUILER_API=$VITE_ALQUILER_API

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# ============================================================
# Etapa 2: RUNTIME - sirve los estaticos con Nginx
# ============================================================
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
