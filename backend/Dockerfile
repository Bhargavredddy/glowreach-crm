# Base image for building
FROM node:20-alpine AS builder

WORKDIR /app

# Copy lock files and package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for TypeScript build & ts-node seed)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client and build typescript
RUN npx prisma generate
RUN npm run build

# Production runner image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy the build artifacts and installed dependencies from builder
COPY --from=builder /app ./

# Expose backend port
ENV PORT=5000
EXPOSE 5000

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Run the entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
