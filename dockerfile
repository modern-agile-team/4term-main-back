FROM node:16.15.1 AS builder

WORKDIR /testDir

COPY ./main-project .

RUN npm install --force
RUN npm run build

CMD ["npm", "run", "start:prod"]