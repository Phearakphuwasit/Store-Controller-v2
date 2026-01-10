# ---------- Stage 1: Build Angular app ----------
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Prevent OOM (EC2 Free Tier)
ENV NODE_OPTIONS=--max_old_space_size=512

# Build Angular in production
RUN npm run build --configuration production


# ---------- Stage: Serve pre-built Angular ----------
FROM nginx:alpine

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy pre-built Angular browser folder
COPY dist/store_controller/browser /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
