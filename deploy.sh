#!/bin/bash

# Script de déploiement pour PS Frontend
# Usage: ./deploy.sh [deploy|restart|logs|status|cleanup|build]

set -e

# Configuration
PROJECT_NAME="ps_front"
DOCKER_COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="backups"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_requirements() {
    log_info "Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        log_error "Fichier docker-compose.yml non trouvé"
        exit 1
    fi
    
    log_success "Prérequis OK"
}

# Fonction de sauvegarde
backup() {
    log_info "Création d'une sauvegarde..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Sauvegarde des logs si le conteneur existe
    if docker ps -a --format "table {{.Names}}" | grep -q "ps_front_app"; then
        docker logs ps_front_app > "$BACKUP_DIR/frontend_logs_$(date +%Y%m%d_%H%M%S).log" 2>&1 || true
    fi
    
    log_success "Sauvegarde créée dans $BACKUP_DIR"
}

# Fonction de build
build_app() {
    log_info "Construction de l'application..."
    
    # Vérifier si le réseau existe
    if ! docker network ls | grep -q "ps_back_app-network"; then
        log_warning "Le réseau ps_back_app-network n'existe pas. Création..."
        docker network create ps_back_app-network
    fi
    
    # Build de l'image
    docker-compose build --no-cache
    
    log_success "Build terminé"
}

# Fonction de déploiement
deploy() {
    log_info "Déploiement de PS Frontend..."
    
    check_requirements
    backup
    
    # Arrêter les anciens conteneurs
    log_info "Arrêt des anciens conteneurs..."
    docker-compose down --remove-orphans || true
    
    # Build et démarrage
    build_app
    
    log_info "Démarrage des conteneurs..."
    docker-compose up -d
    
    # Attendre que le service soit prêt
    log_info "Attente du démarrage du service..."
    sleep 10
    
    # Vérifier l'état des conteneurs
    if docker-compose ps | grep -q "Up"; then
        log_success "✅ Déploiement réussi!"
        status
    else
        log_error "❌ Échec du déploiement"
        logs
        exit 1
    fi
}

# Fonction de redémarrage
restart() {
    log_info "Redémarrage de PS Frontend..."
    
    docker-compose restart
    
    log_success "Redémarrage terminé"
    status
}

# Fonction d'affichage des logs
logs() {
    log_info "Affichage des logs..."
    
    if [ "$2" == "-f" ]; then
        docker-compose logs -f
    else
        docker-compose logs --tail=50
    fi
}

# Fonction d'affichage du statut
status() {
    log_info "État des services:"
    echo ""
    
    # État des conteneurs
    docker-compose ps
    echo ""
    
    # Utilisation des ressources
    log_info "Utilisation des ressources:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep ps_front || echo "Aucun conteneur en cours d'exécution"
    echo ""
    
    # Test de connectivité
    log_info "Test de connectivité:"
    if docker-compose exec -T frontend curl -f http://localhost:80/health &> /dev/null; then
        log_success "✅ Service accessible"
    else
        log_warning "⚠️  Service non accessible"
    fi
}

# Fonction de nettoyage
cleanup() {
    log_warning "Nettoyage du système..."
    
    read -p "Êtes-vous sûr de vouloir nettoyer? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Arrêter et supprimer les conteneurs
        docker-compose down --remove-orphans
        
        # Nettoyer les images non utilisées
        docker image prune -f
        
        # Nettoyer les volumes non utilisés
        docker volume prune -f
        
        log_success "Nettoyage terminé"
    else
        log_info "Nettoyage annulé"
    fi
}

# Fonction d'aide
help() {
    echo "Script de déploiement PS Frontend"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    Déploie l'application (build + start)"
    echo "  build     Construit uniquement l'image Docker"
    echo "  restart   Redémarre les conteneurs"
    echo "  logs      Affiche les logs (ajoutez -f pour le suivi en temps réel)"
    echo "  status    Affiche l'état des services"
    echo "  cleanup   Nettoie les ressources Docker non utilisées"
    echo "  help      Affiche cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 deploy"
    echo "  $0 logs -f"
    echo "  $0 status"
}

# Menu principal
case "${1:-help}" in
    deploy)
        deploy
        ;;
    build)
        check_requirements
        build_app
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$@"
        ;;
    status)
        status
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        help
        ;;
    *)
        log_error "Commande inconnue: $1"
        help
        exit 1
        ;;
esac
