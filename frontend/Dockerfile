# -----------------------------
# Frontend Dockerfile (EC2 Free Tier Safe)
# -----------------------------

# Use Nginx only — no Node build
FROM nginx:alpine

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy pre-built Angular build (browser folder)
COPY dist/store_controller/browser /usr/share/nginx/html

# Copy custom Nginx config for SPA + API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
