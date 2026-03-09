FROM nginx:alpine

# Copy frontend static files into nginx html dir
COPY frontend /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
