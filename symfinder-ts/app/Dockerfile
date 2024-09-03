###############
# build stage #
###############


FROM node:16-alpine AS build

WORKDIR /usr/src/app

COPY package.json tsconfig.json babel.config.js ./

# installs both production and dev dependencies
RUN npm i

COPY . .

RUN npm run build

###############
# final stage #
###############
FROM node:16-alpine

WORKDIR /app

COPY --from=build /usr/src/app ./

COPY ./dockerfile_entrypoint.sh ./

RUN chmod +x ./dockerfile_entrypoint.sh

ENTRYPOINT ["/bin/sh", "./dockerfile_entrypoint.sh"]



