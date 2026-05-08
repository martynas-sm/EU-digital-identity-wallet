# ---- Build stage ----
FROM public.ecr.aws/docker/library/node:23-alpine AS build

WORKDIR /build

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---- Production stage ----
FROM public.ecr.aws/docker/library/nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY cloud-run-nginx.conf /etc/nginx/cloud-run-nginx.conf
COPY --from=build /build/dist /app
