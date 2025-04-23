FROM node:18-slim

WORKDIR /app

# Install dependencies for Sharp and other packages
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Use npm install instead of npm ci
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
