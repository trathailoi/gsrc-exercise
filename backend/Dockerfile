FROM node:17-alpine AS development
RUN apk add dumb-init curl
WORKDIR /usr/src/app

COPY package*.json ./
COPY ./src ./src
COPY ./nest-cli.json ./
COPY ./tsconfig.build.json ./
COPY ./tsconfig.json ./

RUN npm install
RUN npm install @nestjs/platform-express
# RUN npm install -g @nestjs/cli

ARG PORT=80
ENV PORT=${PORT}

ARG API_VERSION=80
ENV API_VERSION=${API_VERSION}

CMD [ "dumb-init", "npx", "nest", "start", "--watch"]

EXPOSE ${PORT}
HEALTHCHECK --interval=5s --timeout=5s CMD curl -f http://127.0.0.1:${PORT}/api/v${API_VERSION}/health || exit 1


# ----------------- BUILD -----------------
FROM node:17-alpine As build

WORKDIR /usr/src/app

COPY --from=development /usr/src/app/ ./
COPY .env.production ./.env

RUN npm run build


# ----------------- PRODUCTION -----------------
FROM node:17-alpine As production
RUN apk add dumb-init curl

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=80
ENV PORT=${PORT}

ARG API_VERSION=80
ENV API_VERSION=${API_VERSION}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=build /usr/src/app/dist ./dist

CMD [ "dumb-init", "node", "dist/main"]

EXPOSE ${PORT}
HEALTHCHECK --interval=5s --timeout=5s CMD curl -f http://127.0.0.1:${PORT}/api/v${API_VERSION}/health || exit 1