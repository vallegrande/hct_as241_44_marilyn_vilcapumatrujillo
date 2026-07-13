# ============================================================
# Etapa 1: BUILD - compila la aplicacion con Maven (JDK 26)
# ============================================================
FROM eclipse-temurin:26-jdk-alpine AS build
WORKDIR /app

# Copiar primero el wrapper y el pom para cachear las dependencias
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -q dependency:go-offline

# Copiar el codigo fuente y empaquetar
COPY src ./src
RUN ./mvnw -q package -DskipTests && cp target/*.jar app.jar

# Extraer el jar: las librerias quedan comprimidas por separado
# (el fat-jar de Spring Boot las guarda sin comprimir y pesa mas)
RUN java -Djarmode=tools -jar app.jar extract --destination extracted

# ============================================================
# Etapa 2: JLINK - crea un runtime de Java minimo (solo los
# modulos que Spring WebFlux + R2DBC necesitan)
# ============================================================
RUN apk add --no-cache binutils && jlink \
    --add-modules java.base,java.compiler,java.desktop,java.logging,java.naming,java.management,java.instrument,java.sql,java.security.jgss,java.security.sasl,java.net.http,jdk.unsupported \
    --strip-debug \
    --no-man-pages \
    --no-header-files \
    --compress=zip-9 \
    --output /jre

# ============================================================
# Etapa 3: RUNTIME - imagen final minima sobre Alpine
# ============================================================
FROM alpine:3.22
ENV JAVA_HOME=/opt/java
ENV PATH="$JAVA_HOME/bin:$PATH"

# Librerias nativas que la JVM necesita en Alpine
RUN apk add --no-cache libstdc++ zlib

COPY --from=build /jre $JAVA_HOME

# Usuario sin privilegios (buena practica de seguridad)
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

WORKDIR /app
COPY --from=build /app/extracted/ ./

EXPOSE 9091
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
