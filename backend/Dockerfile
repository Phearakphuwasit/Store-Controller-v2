# Use Node LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Expose backend port
EXPOSE 5000

# Start backend
CMD ["node", "server.js"]
