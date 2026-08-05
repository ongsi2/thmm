# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Install TypeScript for next.config.ts
RUN npm install typescript

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# 블로그 마크다운. 서버 컴포넌트와 달리 번들에 안 들어가고 런타임에 fs로 읽으므로
# 이 복사가 빠지면 /blog 가 500난다. (라우트가 동적(ƒ)이라 요청 시점에 읽는다)
COPY --from=builder /app/content ./content

# Expose port
EXPOSE 3002

# Start the application
CMD ["npm", "start", "--", "-p", "3002"]
