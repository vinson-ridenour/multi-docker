FROM node:alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

# dev here is nodemon, changed "dev" to "start" for PROD compared to .dev Dockerfile
CMD ["npm", "run", "start"]

