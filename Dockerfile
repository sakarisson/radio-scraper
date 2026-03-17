FROM node:20-alpine
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@8.6.9 --activate

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter scraper build

CMD ["node", "packages/scraper/dist/scraper.js"]
