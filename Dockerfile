# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
COPY backend/package*.json ./

FROM base AS deps
RUN npm ci

FROM deps AS dev
ENV NODE_ENV=development
COPY backend/ ./
RUN npm run build
CMD ["npm", "run", "start"]

FROM deps AS build
COPY backend/ ./
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
CMD ["node", "dist/index.js"]
