# Northvale Learn — build the app, then run only what the server needs.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8950 TRUST_PROXY=1 NORTHVALE_DATA=/data
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force && apk add --no-cache su-exec
COPY --from=build /app/web ./web
COPY server ./server
COPY src ./src
COPY docs ./docs
# For restoring a backup on the server (docs/DEPLOY.md).
COPY scripts/restore.mjs ./scripts/restore.mjs
# The data volume is mounted owned by root; hand it to the unprivileged
# "node" user, then run the server as that user.
CMD ["sh", "-c", "mkdir -p /data && chown -R node:node /data && exec su-exec node node server/index.js"]
EXPOSE 8950
