# Use Node.js runtime as parent image
FROM node:20-slim AS builder

# Install project into `/app`
WORKDIR /app

# Copy package.json into container
COPY ./frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy source code into container
COPY ./frontend .

# Build React application for production
RUN npm run build

FROM nginx:alpine

# Copy built React application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration file
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
