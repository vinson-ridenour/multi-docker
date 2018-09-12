FROM node:alpine as builder 

WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY . .

# builds PROD version of frontend assets, so now in /app folder will be a folder called /build (that's where PROD
# assets get placed)
RUN npm run build


FROM nginx 
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# copy all from build step above from /app/build to /usr/share/...
COPY --from=builder /app/build /usr/share/nginx/html