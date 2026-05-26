FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Directory for the SQLite volume mount
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "server.js"]
