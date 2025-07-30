# Dockerfile
FROM node:20-alpine

# Update apk packages and install security updates to reduce vulnerabilities
RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .

EXPOSE 3000

CMD ["npm", "run", "dev"]
