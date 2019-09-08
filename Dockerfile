FROM node:10.16

ARG NODE_ENV=development1
ENV NODE_ENV=${NODE_ENV}

USER root

RUN useradd -d /home/ubuntu -m ubuntu \
	&& mkdir -p /home/ubuntu/pluang \
	&& mkdir -p /home/ubuntu/pluang/uploads

WORKDIR /home/ubuntu/pluang

COPY package*.json ./

RUN npm install && \
    npm install nodemon -g

COPY . /home/ubuntu/pluang

EXPOSE 3000 80

CMD [ "npm", "start" ]