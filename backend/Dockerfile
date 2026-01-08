# Use Node LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy backend source
COPY . .

# Expose port
EXPOSE 5000

# Start backend
CMD ["node", "server.js"]
