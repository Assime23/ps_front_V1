# Stage 1: Builder
FROM node:18-alpine as builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (dev + production) pour le build
RUN npm ci --silent

# Copier le code source
COPY . .

# Variables d'environnement pour la build
ENV NODE_ENV=production
ENV REACT_APP_API_URL=https://api1.psmyservices.com
ENV REACT_APP_API_BASE_URL=https://api1.psmyservices.com/api

# Construire l'application
RUN npm run build

# Stage 2: Production
FROM nginx:1.25-alpine

# Installer curl pour les health checks
RUN apk add --no-cache curl

# Copier les fichiers construits
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier les configurations Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-main.conf /etc/nginx/nginx.conf

# Créer les répertoires nécessaires et ajuster les permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx

# Créer un script de démarrage
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exposer le port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Point d'entrée
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
