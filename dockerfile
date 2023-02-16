FROM node:16.15.1 AS builder

WORKDIR /home/app

COPY ./main-project .
COPY default.conf /etc/nginx/conf.d/default.conf

RUN npm install --force npm@8.19.2
RUN npm run build

CMD ["npm", "run", "start:prod"]
