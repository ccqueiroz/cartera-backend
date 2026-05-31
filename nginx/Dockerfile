FROM nginx:alpine

RUN apk add --no-cache curl

RUN echo 'Deletando nginx.conf & default.conf'

RUN rm /etc/nginx/nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

RUN echo 'Copiando os arquivos nginx.conf & default.conf para o container'

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]