# Node.js Backend Dockerfile
FROM node:18-slim

WORKDIR /app

# Dependencies install karo
COPY package*.json ./
RUN npm install

# Source copy karo
COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]