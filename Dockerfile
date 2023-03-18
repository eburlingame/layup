FROM node:16-alpine3.16

RUN apk add postgresql rsync

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

CMD [ "yarn", "start" ]