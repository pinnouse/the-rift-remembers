FROM public.ecr.aws/docker/library/node:current-alpine3.22 AS build

WORKDIR /app

RUN apk add git

COPY package*.json .

RUN npm install

COPY . .

ENV HOSTNAME=0.0.0.0
RUN npm run build

FROM public.ecr.aws/docker/library/node:current-alpine3.22

WORKDIR /app

RUN apk add git curl # for self health check

COPY package*.json .

ENV PORT=2567
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
RUN npm install --omit=dev

RUN mkdir build
COPY --from=build /app/build build/

EXPOSE 2567

CMD ["node", "build/server.js"]
