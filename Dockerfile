FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock tsconfig.json /app/
COPY src/ /app/src/
RUN mkdir -p /app/public
ENTRYPOINT [ "bun", "start" ]