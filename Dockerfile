# Stage 1: Builder
FROM node:18-alpine as builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production --silent

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

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user

# Ajuster les permissions
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d

# Créer un script de démarrage
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exposer le port
EXPOSE 80

# Utiliser l'utilisateur non-root
USER nginx-user

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Point d'entrée
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
