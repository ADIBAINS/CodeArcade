FROM maven:3.9-eclipse-temurin-17-jammy AS build
WORKDIR /app
COPY judge-core/pom.xml .
RUN mvn dependency:go-offline -q
COPY judge-core/src ./src
RUN mvn package -q -DskipTests

FROM eclipse-temurin:17-jre-jammy
RUN apt-get update && apt-get install -y --no-install-recommends g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/target/codearcade-judge-core-1.0.0.jar ./judge.jar
RUN mkdir -p /app/workspaces
EXPOSE 8080
CMD ["java", "-jar", "judge.jar"]
