# --- Build Stage ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime Stage ---
FROM nginx:alpine
# Copy the built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the config FROM the build stage where it already exists
# Because we used "COPY . ." in the build stage, nginx.conf 
# is now inside the build image at /app/nginx.conf
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
