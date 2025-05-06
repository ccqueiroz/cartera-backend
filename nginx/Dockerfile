FROM nginx:alpine

RUN rm /etc/nginx/nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY ./conf.d/default.conf /etc/nginx/conf.d/

CMD envsubst '$PORT' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf && \
    nginx -g 'daemon off;'