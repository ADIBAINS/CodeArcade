FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY judge-core/pom.xml .
RUN mvn dependency:go-offline -q
COPY judge-core/src ./src
RUN mvn package -q -DskipTests

FROM eclipse-temurin:17-jre
# The judge invokes Docker on the host through the mounted Docker socket in
# production.  The image needs the CLI; it does not run a Docker daemon itself.
RUN apt-get update && apt-get install -y --no-install-recommends docker.io g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/target/codearcade-judge-core-1.0.0.jar ./judge.jar
RUN mkdir -p /app/workspaces
EXPOSE 8080
CMD ["java", "-jar", "judge.jar"]
