FROM node:22-alpine AS builder

WORKDIR /app

# Installation explicite des bibliothèques SSL et libc requises par le moteur Prisma
RUN apk add --no-cache openssl libc6-compat

# Copie des dépendances backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm install

# Copie du code source backend
COPY backend/ ./

RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

# Installation de libssl sur l'image d'exécution
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=5000

COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm install --only=production
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/server.js"]
