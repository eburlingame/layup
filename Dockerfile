FROM node:16-alpine3.16

RUN apk add postgresql rsync curl bash

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

RUN echo -e '#!/bin/bash\ncurl localhost:4809/backup' > /usr/bin/backup && \
    chmod +x /usr/bin/backup

CMD [ "yarn", "start" ]