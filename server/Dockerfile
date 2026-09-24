FROM maven:3.9.11-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline
COPY src src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S kindred && adduser -S kindred -G kindred
WORKDIR /app
COPY --from=build /build/target/kindred-nonprofit-api-1.0.0.jar app.jar
RUN mkdir -p /app/data && chown -R kindred:kindred /app
USER kindred
EXPOSE 8080
VOLUME ["/app/data"]
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
