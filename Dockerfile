# Dockerfile

# base image
FROM node:20-alpine
WORKDIR /usr/src

COPY package*.json ./
RUN npm ci

COPY . .

# Build-time vars needed for static generation/prefetch
ARG NEXT_PUBLIC_SUPPLEMENTAL_SOLR
ARG SOLR_USER
ARG SOLR_PASS
ENV NEXT_PUBLIC_SUPPLEMENTAL_SOLR=$NEXT_PUBLIC_SUPPLEMENTAL_SOLR
ENV SOLR_USER=$SOLR_USER
ENV SOLR_PASS=$SOLR_PASS

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
