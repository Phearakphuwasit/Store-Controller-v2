# Use Node.js LTS (lightweight)
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy the rest of the backend source code
COPY . .

# Ensure uploads directory exists (for volume mount)
RUN mkdir -p /app/uploads

# Set environment
ENV NODE_ENV=production

# Expose backend port
EXPOSE 5000

# Start the backend
CMD ["node", "server.js"]
