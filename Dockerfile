FROM node:22-alpine AS build
COPY ./ ./
RUN npm ci
RUN npm run build

FROM node:22-alpine AS prod

COPY --from=build ./package.json ./package.json
COPY --from=build ./package-lock.json ./package-lock.json
COPY --from=build ./node_modules ./node_modules
COPY --from=build ./dist ./dist
ENTRYPOINT ["npm", "run", "prod"]
