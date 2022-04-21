FROM node:17-alpine AS development
# RUN apk add bash dumb-init curl
WORKDIR /usr/src/app
#RUN apk update && apk add --no-cache nmap bash dumb-init curl && \
#    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
#    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
#    apk update && \
#    apk add --no-cache \
#      chromium@edge \
#      harfbuzz \
#      "freetype>2.8" \
#      ttf-freefont \
#      nss@edge

RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache bash dumb-init curl \
    udev \
    ttf-freefont \
    chromium \
    nss \
    && npm install puppeteer

#ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

COPY package*.json ./
COPY ./src ./src
COPY ./nest-cli.json ./
COPY ./tsconfig.build.json ./
COPY ./tsconfig.json ./
COPY ./.env ./

RUN npm install

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
# RUN apk add bash dumb-init curl
WORKDIR /usr/src/app
#RUN apk update && apk add --no-cache nmap bash dumb-init curl && \
#    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
#    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
#    apk update && \
#    apk add --no-cache \
#      chromium@edge \
#      harfbuzz \
#      "freetype>2.8" \
#      ttf-freefont \
#      nss@edge

RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache bash dumb-init curl \
    udev \
    ttf-freefont \
    chromium \
    nss \
    && npm install puppeteer

#ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=80
ENV PORT=${PORT}

ARG API_VERSION=80
ENV API_VERSION=${API_VERSION}

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=build /usr/src/app/dist ./dist

CMD [ "dumb-init", "node", "dist/main"]

EXPOSE ${PORT}
HEALTHCHECK --interval=5s --timeout=5s CMD curl -f http://127.0.0.1:${PORT}/api/v${API_VERSION}/health || exit 1