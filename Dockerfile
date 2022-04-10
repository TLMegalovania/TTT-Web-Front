FROM node:lts-alpine AS build
WORKDIR /src
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npx vite build

FROM nginx:stable-alpine
WORKDIR /app
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /src/dist .
EXPOSE 80
