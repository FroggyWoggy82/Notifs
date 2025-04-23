FROM node:18-slim

WORKDIR /app

# Install dependencies for Sharp and other packages
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Use npm ci for faster, more reliable builds
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
