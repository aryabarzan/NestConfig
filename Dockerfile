FROM node:20-slim as BUILD_IMAGE

#RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

WORKDIR /usr/src/app
COPY .npmrc ./
COPY package.json ./
RUN npm i 
COPY . .

RUN npm run build
RUN npm prune --omit=dev
#RUN /usr/local/bin/node-prune

FROM node:20-alpine

WORKDIR /app

# copy from build image
COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules
COPY static ./static

EXPOSE 8080

CMD [ "node", "/app/dist/main.js" ]