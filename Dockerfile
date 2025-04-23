# Build stage
FROM node:18-slim AS build

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Set npm to not use fund, audit, or progress bar to speed up install
RUN npm config set fund false && \
    npm config set audit false && \
    npm config set progress false

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Production stage
FROM node:18-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libvips \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy built node modules and other files from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy application files
COPY . .

# Expose the port the app runs on
ENV PORT=3003
EXPOSE 3003

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3003/ || exit 1

# Start the application
CMD ["npm", "start"]
