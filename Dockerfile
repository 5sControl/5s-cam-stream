FROM node:22.13.1-slim AS builder

WORKDIR /usr/app/service
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:22.13.1-slim AS production

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/app/service
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod 
COPY --from=builder /usr/app/service/dist ./dist
CMD ["node", "dist/main.js"]