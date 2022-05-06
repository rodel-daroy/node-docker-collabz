FROM node:14

ARG workdir=/app
WORKDIR ${workdir}
COPY . .
RUN npm install
RUN npm i -g nodemon
CMD [ "npm", "run", "dev" ]