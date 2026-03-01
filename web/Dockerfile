# web/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --loglevel verbose

# Copy the rest of the code
COPY . .

EXPOSE 5173

# Run Vite dev server and expose it to the Docker network
CMD ["npm", "run", "dev", "--", "--host"]