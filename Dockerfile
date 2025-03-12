FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS build
COPY package.json bun.lock tsconfig.json /app/
COPY src/ /app/src/
RUN bun install --frozen-lockfile
RUN bun run build

FROM base AS release
COPY --from=build /app/out/ /app/
RUN mkdir -p /app/public
USER bun
ENTRYPOINT [ "bun", "run", "index.js" ]