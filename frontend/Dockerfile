# Stage 1: Build the frontend code
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build # This creates the 'dist' folder

# Stage 2: Serve using nginx
FROM nginx:stable-alpine
# Copy the built files from the builder stage
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# --- NEW: Copy your specific NGINX config for routing/proxy ---
# Make sure your nginx.conf is in the same directory as this Dockerfile (./frontend)
COPY nginx.conf /etc/nginx/conf.d/default.conf 

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]