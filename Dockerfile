# Use Node.js as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files from root
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source files from root
COPY src ./src

# Install ts-node globally
RUN npm install -g ts-node typescript

# Set the entry point
ENTRYPOINT ["ts-node", "src/index.ts"]
