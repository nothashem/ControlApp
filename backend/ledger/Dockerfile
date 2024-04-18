# Use the official Node.js image as base image
FROM node:21.6.2-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json files into the container at /app
COPY package*.json ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the current directory contents into the container at /app
COPY . .

# Expose port 5002 to the outside world
EXPOSE 5002

# Command to run the application
CMD ["pnpm", "start"]
