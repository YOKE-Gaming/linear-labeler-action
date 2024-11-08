# Use Node.js as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
COPY tsconfig.json ./
RUN npm install

# Copy source files
COPY src ./src

# Install ts-node globally
RUN npm install -g ts-node typescript

# Set the entry point (assuming index.ts is the main entry file)
ENTRYPOINT ["ts-node", "src/index.ts"]