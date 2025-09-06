#!/bin/bash

# Script de déploiement simple pour PS Frontend
# Usage: ./deploy-simple.sh [deploy|restart|logs|status|cleanup]

set -e

case "${1:-deploy}" in
    deploy)
        echo "🚀 Déploiement PS Frontend..."
        
        # Créer le réseau s'il n'existe pas
        docker network create ps_back_app-network 2>/dev/null || true
        
        # Arrêter et supprimer les anciens conteneurs
        docker-compose down --remove-orphans 2>/dev/null || true
        
        # Construire et démarrer
        docker-compose up -d --build
        
        echo "✅ Déploiement terminé"
        ;;
    restart)
        echo "🔄 Redémarrage..."
        docker-compose restart
        echo "✅ Redémarrage terminé"
        ;;
    logs)
        docker-compose logs -f
        ;;
    status)
        echo "📊 État des conteneurs:"
        docker-compose ps
        ;;
    cleanup)
        echo "🧹 Nettoyage..."
        docker-compose down
        docker system prune -f
        echo "✅ Nettoyage terminé"
        ;;
    *)
        echo "Usage: $0 [deploy|restart|logs|status|cleanup]"
        exit 1
        ;;
esac
