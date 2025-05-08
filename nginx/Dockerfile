FROM nginx:alpine

RUN echo 'Instalando Dockerize - NGINX'

ENV DOCKERIZE_VERSION v0.7.0

RUN apk add --no-cache wget \
    && wget -O - https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz | tar xzf - -C /usr/local/bin \
    && rm -rf /var/cache/apk/*


RUN echo 'Deletando nginx.conf & default.conf'

RUN rm /etc/nginx/nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

RUN echo 'Copiando os arquivos nginx.conf & default.conf para o container'

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]