FROM node:24-alpine
WORKDIR /app
COPY . .
RUN node build.mjs
ENV HOST=0.0.0.0 PORT=4783 DATA_DIR=/data
EXPOSE 4783
VOLUME /data
CMD ["node", "server/start.mjs"]
