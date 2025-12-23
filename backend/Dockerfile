# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN DATABASE_URL="postgresql://user:password@localhost:5432/db" npx prisma generate
RUN npm run build

# Stage 2: Run
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client /app/node_modules/@prisma/client

COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/src/main.js"]
