FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate the client
RUN npm install
RUN npx prisma generate

# Copy the rest of the code
COPY . .

EXPOSE 3000
CMD ["npx", "ts-node", "src/index.ts"]