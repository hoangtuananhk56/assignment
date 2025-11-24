# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 5173

# Start application (overridden by docker-compose command)
CMD ["npm", "run", "dev", "--", "--host"]
