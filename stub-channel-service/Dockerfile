# Base image for building
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy production dependencies and build artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose port
ENV PORT=5001
EXPOSE 5001

# Start the Express server
CMD ["npm", "run", "start"]
