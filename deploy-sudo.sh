#!/bin/bash

# Script de déploiement avec gestion des permissions pour PS Frontend
# Usage: ./deploy-sudo.sh [deploy|restart|logs|status|cleanup|build]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_SCRIPT="$SCRIPT_DIR/deploy.sh"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Vérifier les permissions Docker
check_docker_permissions() {
    log_info "Vérification des permissions Docker..."
    
    if docker ps &> /dev/null; then
        log_success "Permissions Docker OK"
        return 0
    else
        log_warning "Permissions Docker insuffisantes, utilisation de sudo"
        return 1
    fi
}

# Vérifier que le script de déploiement existe
check_deploy_script() {
    if [ ! -f "$DEPLOY_SCRIPT" ]; then
        log_error "Script de déploiement non trouvé: $DEPLOY_SCRIPT"
        exit 1
    fi
    
    if [ ! -x "$DEPLOY_SCRIPT" ]; then
        log_info "Rendre le script de déploiement exécutable..."
        chmod +x "$DEPLOY_SCRIPT"
    fi
}

# Exécuter le script de déploiement avec les bonnes permissions
run_deploy_script() {
    local command="$1"
    
    check_deploy_script
    
    if check_docker_permissions; then
        # Exécuter directement
        log_info "Exécution de: $DEPLOY_SCRIPT $command"
        "$DEPLOY_SCRIPT" "$command"
    else
        # Exécuter avec sudo
        log_info "Exécution avec sudo: $DEPLOY_SCRIPT $command"
        sudo "$DEPLOY_SCRIPT" "$command"
    fi
}

# Afficher les informations système
show_system_info() {
    log_info "Informations système:"
    echo "  - Utilisateur actuel: $(whoami)"
    echo "  - Groupes: $(groups)"
    echo "  - Docker installé: $(docker --version 2>/dev/null || echo 'Non')"
    echo "  - Docker Compose installé: $(docker-compose --version 2>/dev/null || echo 'Non')"
    
    if docker ps &> /dev/null; then
        echo "  - Permissions Docker: ✅ OK"
    else
        echo "  - Permissions Docker: ⚠️ Sudo requis"
    fi
    
    echo "  - Répertoire de travail: $(pwd)"
}

# Aide
show_help() {
    echo "Script de déploiement PS Frontend avec gestion automatique des permissions"
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
    echo "  info      Affiche les informations système"
    echo "  test      Teste le build local sans Docker"
    echo "  help      Affiche cette aide"
    echo ""
    echo "Ce script détecte automatiquement si sudo est nécessaire pour Docker."
    echo ""
    echo "Exemples:"
    echo "  $0 deploy"
    echo "  $0 logs -f"
    echo "  $0 status"
    echo "  $0 test    # Test sans Docker"
}

# Test de build local
run_local_test() {
    local test_script="$SCRIPT_DIR/test-build.sh"
    
    if [ -f "$test_script" ]; then
        log_info "Exécution du test de build local..."
        "$test_script"
    else
        log_error "Script de test non trouvé: $test_script"
        exit 1
    fi
}

# Menu principal
case "${1:-help}" in
    deploy|build|restart|logs|status|cleanup)
        run_deploy_script "$1"
        ;;
    info)
        show_system_info
        ;;
    test)
        run_local_test
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Commande inconnue: $1"
        show_help
        exit 1
        ;;
esac
