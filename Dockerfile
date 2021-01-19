FROM node:15

# Create app directory
WORKDIR /server
COPY package*.json /server
COPY build /server/build
COPY public /server/public
RUN npm install --unsafe-perm

EXPOSE 3000
CMD [ "npm", "start"]