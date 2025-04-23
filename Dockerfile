FROM node:20-alpine3.18

WORKDIR /app

# Install only the minimal dependencies needed for Sharp and healthcheck
RUN apk add --no-cache vips-dev wget

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
ENV PORT=3003
EXPOSE 3003

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3003/ || exit 1

# Start the application
CMD ["npm", "start"]
