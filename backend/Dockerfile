# --- Build Stage ---
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copy Maven wrapper configuration and project descriptor
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Fix potential Windows line endings (CRLF) in the mvnw script and make it executable
RUN tr -d '\r' < mvnw > mvnw.tmp && mv mvnw.tmp mvnw && chmod +x mvnw

# Download dependencies to cache them in the Docker layer
RUN ./mvnw dependency:go-offline -B

# Copy application source code
COPY src ./src

# Build the application package, skipping tests for faster build times
RUN ./mvnw clean package -DskipTests

# --- Runtime Stage ---
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose backend port
EXPOSE 8060

# Add a non-root system user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
