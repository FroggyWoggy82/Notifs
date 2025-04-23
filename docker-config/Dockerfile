FROM node:18-bookworm-slim@sha256:b3c8cbc9a9e5a2a0aea5a3a903b15b6f8b2a5c0c3e7af7e8f87a4a4d2b1a5a5a

WORKDIR /app

# Install dependencies for Sharp and other packages
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json package-lock.json ./

# Install dependencies with production flag
RUN npm install --production --no-optional --no-audit --progress=false

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
