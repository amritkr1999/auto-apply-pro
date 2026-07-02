# --- Build Stage ---
FROM node:22-alpine AS build
WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install packages clean and fast
RUN npm ci

# Copy application source files
COPY . .

# Run build script (produces production build in /app/dist)
RUN npm run build

# --- Runtime Stage ---
FROM nginx:alpine

# Copy built frontend assets to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx server configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
