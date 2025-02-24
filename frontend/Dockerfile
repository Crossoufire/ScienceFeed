# Use Node.js runtime as parent image
FROM node:20-alpine AS builder

# Install project into `/app`
WORKDIR /app

# Copy frontend code into container
COPY . .

# Install frontend dependencies
RUN npm install

# Build React application for production
RUN npm run build

FROM nginx:alpine

# Copy built React application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
