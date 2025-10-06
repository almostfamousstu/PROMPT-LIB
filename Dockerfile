# syntax=docker/dockerfile:1.4

FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
RUN apk add --no-cache libc6-compat \
    && corepack enable

FROM base AS deps
ENV NODE_ENV=development
COPY package.json ./
# Allow installs without a lockfile while still using pnpm
RUN pnpm install --frozen-lockfile=false

FROM deps AS builder
COPY . .
RUN pnpm build

FROM base AS runner
# Copy production node_modules and build output
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["pnpm", "start"]
