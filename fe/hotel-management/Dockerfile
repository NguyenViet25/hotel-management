# Build the frontend with Node and serve using Nginx
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

# Allow overriding API base URL at build time
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# Start nginx with custom configuration for SPA routing
CMD ["nginx", "-g", "daemon off;"]