FROM node:10-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY ./.env .

RUN npm install

COPY . .

# RUN npm test

RUN chmod +x start.sh

EXPOSE 3000

CMD [ "./start.sh" ]