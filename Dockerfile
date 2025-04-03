# Base Node.js image
FROM node:18-alpine AS base

# Create app directory
WORKDIR /app

# Install dependencies for production
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Development stage
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Create directory for images
RUN mkdir -p ./images
RUN chmod 777 ./images

# Expose the port the app runs on
EXPOSE 3000

CMD ["node", "dist/server.js"]