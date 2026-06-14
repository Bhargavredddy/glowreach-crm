# Base image for building
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js application
# Next.js expects env variables to compile statically if needed, 
# but NEXT_PUBLIC_API_URL can be set at runtime or build time depending on layout.
# We build standard Next.js build.
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy dependencies and production build files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Expose port
ENV PORT=3000
EXPOSE 3000

# Start Next.js app
CMD ["npm", "run", "start"]
