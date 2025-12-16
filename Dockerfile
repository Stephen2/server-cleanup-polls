FROM node:24-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create a folder for the persistent database
RUN mkdir -p /data

# Set the default DB path to the persistent folder
ENV DB_PATH="/data/db.txt"

# Start the app
CMD ["npm", "run", "start"]
