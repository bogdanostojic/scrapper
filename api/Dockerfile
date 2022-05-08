FROM node:14-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

RUN npm

COPY . .

EXPOSE 3000