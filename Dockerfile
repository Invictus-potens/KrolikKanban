# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"] 