FROM node:alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
ENV GENERATE_SOURCEMAP=false
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]