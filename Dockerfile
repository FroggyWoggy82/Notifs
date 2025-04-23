FROM node:22-alpine

WORKDIR /app

# Install dependencies for Sharp and other packages
RUN apk add --no-cache \
    build-base \
    python3

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
