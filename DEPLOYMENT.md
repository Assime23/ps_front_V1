# 🚀 Guide de Déploiement - PS Frontend

Ce guide vous accompagne dans le déploiement de l'application frontend Papou Service.

## 📋 Prérequis

- Docker et Docker Compose installés
- Accès au serveur de production
- Le backend PS doit être déployé et accessible

## 🛠️ Installation Rapide

### 1. Clonage du projet
```bash
cd /var/www
git clone https://github.com/Assime23/ps_front_V1.git ps_front
cd ps_front
```

### 2. Déploiement automatique
```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Déployer l'application
./deploy.sh deploy
```

## 📁 Fichiers de Configuration

### `docker-compose.yml`
Configuration des services Docker avec:
- ✅ Intégration au réseau backend
- ✅ Labels Traefik pour SSL automatique
- ✅ Health checks
- ✅ Volumes pour les logs

### `Dockerfile`
Build multi-stage optimisé:
- ✅ Node.js 18 Alpine pour la build
- ✅ Nginx Alpine pour la production
- ✅ Sécurité renforcée (utilisateur non-root)
- ✅ Health checks intégrés

### `nginx.conf`
Configuration Nginx avancée:
- ✅ Support SPA (Single Page Application)
- ✅ Cache optimisé pour les assets
- ✅ Headers de sécurité
- ✅ Compression gzip
- ✅ Logs structurés

### Variables d'environnement
- `.env.production` - Configuration production
- `.env.local` - Configuration développement

## 🔧 Commandes Disponibles

```bash
# Déploiement complet
./deploy.sh deploy

# Redémarrage des services
./deploy.sh restart

# Voir les logs
./deploy.sh logs
./deploy.sh logs -f  # Suivi en temps réel

# Vérifier l'état
./deploy.sh status

# Build uniquement
./deploy.sh build

# Nettoyage du système
./deploy.sh cleanup

# Aide
./deploy.sh help
```

## 🌐 URLs et Accès

### Production
- **Frontend**: https://psmyservices.com
- **API Backend**: https://api1.psmyservices.com

### Health Checks
- **Frontend Health**: https://psmyservices.com/health
- **Nginx Status**: Logs disponibles via `./deploy.sh logs`

## 🔍 Surveillance et Monitoring

### Vérification rapide
```bash
# État des conteneurs
./deploy.sh status

# Logs en temps réel
./deploy.sh logs -f

# Ressources système
docker stats
```

### Logs spécifiques
```bash
# Logs Nginx
docker-compose exec frontend tail -f /var/log/nginx/ps_front_access.log

# Logs d'erreur
docker-compose exec frontend tail -f /var/log/nginx/ps_front_error.log
```

## 🚨 Résolution de Problèmes

### L'application ne démarre pas
```bash
# Vérifier les logs
./deploy.sh logs

# Reconstruire l'image
./deploy.sh build

# Redéployer complètement
./deploy.sh deploy
```

### Problèmes de réseau
```bash
# Vérifier le réseau Docker
docker network ls | grep ps_back

# Recréer le réseau si nécessaire
docker network create ps_back_app-network
```

### SSL/HTTPS ne fonctionne pas
```bash
# Vérifier les labels Traefik
docker-compose config

# Redémarrer Traefik (depuis le backend)
cd /var/www/ps_back && ./deploy.sh restart
```

### Problèmes de performance
```bash
# Vérifier l'utilisation des ressources
docker stats

# Optimiser les images
./deploy.sh cleanup
docker system prune -f
```

## 🔄 Mises à Jour

### Mise à jour du code
```bash
# Récupérer les dernières modifications
git pull origin main

# Redéployer
./deploy.sh deploy
```

### Mise à jour des dépendances
```bash
# Reconstruire avec --no-cache
docker-compose build --no-cache

# Redémarrer
./deploy.sh restart
```

## 🛡️ Sécurité

### Headers de sécurité configurés
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Content-Security-Policy
- ✅ Referrer-Policy

### Bonnes pratiques appliquées
- ✅ Utilisateur non-root dans le conteneur
- ✅ Cache optimisé pour les assets
- ✅ Logs sécurisés
- ✅ Variables d'environnement protégées

## 📊 Performance

### Cache configuré
- **HTML**: Pas de cache (SPA)
- **Assets statiques**: 1 an
- **Images**: 1 mois
- **Polices**: 1 an

### Compression
- ✅ Gzip activé pour tous les types de fichiers texte
- ✅ Niveau de compression optimisé (6)

## 📞 Support

En cas de problème:

1. Consultez les logs: `./deploy.sh logs`
2. Vérifiez l'état: `./deploy.sh status`
3. Tentez un redémarrage: `./deploy.sh restart`
4. En dernier recours: `./deploy.sh deploy`

## 🎉 Validation du Déploiement

Après déploiement, vérifiez:

✅ **Frontend accessible**: `curl https://psmyservices.com`
✅ **Health check**: `curl https://psmyservices.com/health`
✅ **SSL valide**: Certificat vert dans le navigateur
✅ **API connectée**: Testez une fonctionnalité de l'app

---

**🎯 Architecture**: Frontend indépendant avec SSL automatique et monitoring intégré!
./deploy.sh deploy    # Déploiement complet
./deploy.sh restart   # Redémarrage
./deploy.sh logs      # Voir les logs
./deploy.sh status    # État des services
./deploy.sh cleanup   # Nettoyage


./update.sh full      # Mise à jour complète
./update.sh code      # Code uniquement
./update.sh deps      # Dépendances
./update.sh config    # Configurations

./monitor.sh start    # Monitoring continu
./monitor.sh status   # État actuel
./monitor.sh check    # Vérification unique
./monitor.sh alerts   # Alertes récentes