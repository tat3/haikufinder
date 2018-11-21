FROM node:10.11.0

ENV NODE_ENV=production
EXPOSE 3000

WORKDIR /code
RUN cd /code
COPY yarn.lock /code/yarn.lock
COPY package.json /code/package.json
RUN yarn install

COPY . .

CMD node index.js