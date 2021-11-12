From node

WORKDIR /usr/app

COPY package.json .
RUN yarn install --prod

COPY . .
RUN yarn build

CMD ["yarn", "start:prod"]