#!/bin/bash

# Script de mise à jour pour PS Frontend
# Usage: ./update.sh [patch|minor|major]

set -e

# Configuration
PROJECT_NAME="ps_front"
REMOTE_REPO="origin"
MAIN_BRANCH="main"

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

# Vérifier le statut Git
check_git_status() {
    log_info "Vérification du statut Git..."
    
    if ! git diff-index --quiet HEAD --; then
        log_error "Il y a des modifications non commitées"
        echo "Veuillez commiter ou stasher vos modifications avant de continuer."
        exit 1
    fi
    
    log_success "Répertoire Git propre"
}

# Mettre à jour depuis le dépôt distant
update_from_remote() {
    log_info "Mise à jour depuis le dépôt distant..."
    
    # Fetch les dernières modifications
    git fetch $REMOTE_REPO
    
    # Vérifier s'il y a des modifications
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})
    
    if [ $LOCAL = $REMOTE ]; then
        log_info "Aucune mise à jour disponible"
        return 1
    else
        log_info "Nouvelles modifications détectées"
        git pull $REMOTE_REPO $MAIN_BRANCH
        log_success "Code mis à jour"
        return 0
    fi
}

# Créer une sauvegarde avant mise à jour
create_backup() {
    log_info "Création d'une sauvegarde..."
    
    BACKUP_DIR="backups/pre_update_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Sauvegarder les logs actuels
    if docker ps --format "table {{.Names}}" | grep -q "ps_front_app"; then
        docker logs ps_front_app > "$BACKUP_DIR/frontend_logs.log" 2>&1 || true
    fi
    
    # Sauvegarder la configuration
    cp docker-compose.yml "$BACKUP_DIR/" 2>/dev/null || true
    cp .env.production "$BACKUP_DIR/" 2>/dev/null || true
    
    log_success "Sauvegarde créée dans $BACKUP_DIR"
}

# Vérifier que l'application fonctionne après mise à jour
verify_deployment() {
    log_info "Vérification du déploiement..."
    
    # Attendre que le service soit prêt
    sleep 15
    
    # Vérifier que le conteneur fonctionne
    if ! docker-compose ps | grep -q "Up"; then
        log_error "Le conteneur ne fonctionne pas correctement"
        return 1
    fi
    
    # Test health check
    for i in {1..6}; do
        if docker-compose exec -T frontend curl -f http://localhost:80/health &> /dev/null; then
            log_success "✅ Health check réussi"
            return 0
        fi
        log_info "Tentative $i/6 du health check..."
        sleep 10
    done
    
    log_error "❌ Health check échoué"
    return 1
}

# Rollback en cas de problème
rollback() {
    log_warning "Rollback en cours..."
    
    # Revenir au commit précédent
    git reset --hard HEAD~1
    
    # Redéployer
    ./deploy.sh deploy
    
    log_warning "Rollback effectué"
}

# Mise à jour complète
full_update() {
    log_info "🚀 Démarrage de la mise à jour complète..."
    
    # Vérifications préliminaires
    check_git_status
    
    # Créer une sauvegarde
    create_backup
    
    # Mettre à jour le code
    if update_from_remote; then
        log_info "Redéploiement avec le nouveau code..."
        
        # Déployer avec le nouveau code
        if ./deploy.sh deploy; then
            # Vérifier que tout fonctionne
            if verify_deployment; then
                log_success "🎉 Mise à jour réussie!"
                ./deploy.sh status
            else
                log_error "La vérification a échoué, rollback..."
                rollback
                exit 1
            fi
        else
            log_error "Le déploiement a échoué, rollback..."
            rollback
            exit 1
        fi
    else
        log_info "Aucune mise à jour nécessaire"
    fi
}

# Mise à jour des dépendances uniquement
update_dependencies() {
    log_info "Mise à jour des dépendances..."
    
    create_backup
    
    # Rebuild avec --no-cache pour forcer la mise à jour des dépendances
    if ./deploy.sh build; then
        ./deploy.sh restart
        
        if verify_deployment; then
            log_success "✅ Dépendances mises à jour"
        else
            log_error "❌ Problème après mise à jour des dépendances"
            ./deploy.sh restart
        fi
    else
        log_error "Échec de la mise à jour des dépendances"
        exit 1
    fi
}

# Mise à jour des configurations uniquement
update_config() {
    log_info "Mise à jour des configurations..."
    
    create_backup
    
    # Redémarrer pour appliquer les nouvelles configurations
    ./deploy.sh restart
    
    if verify_deployment; then
        log_success "✅ Configurations mises à jour"
    else
        log_error "❌ Problème avec les nouvelles configurations"
        ./deploy.sh restart
    fi
}

# Affichage de l'aide
show_help() {
    echo "Script de mise à jour PS Frontend"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  full          Mise à jour complète (code + rebuild)"
    echo "  code          Mise à jour du code uniquement"
    echo "  deps          Mise à jour des dépendances"
    echo "  config        Mise à jour des configurations"
    echo "  status        Afficher l'état actuel"
    echo "  help          Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 full       # Mise à jour complète recommandée"
    echo "  $0 code       # Juste le code, sans rebuild"
    echo "  $0 deps       # Rebuild pour mettre à jour les dépendances"
}

# Menu principal
case "${1:-full}" in
    full)
        full_update
        ;;
    code)
        check_git_status
        create_backup
        if update_from_remote; then
            ./deploy.sh restart
            verify_deployment
        fi
        ;;
    deps)
        update_dependencies
        ;;
    config)
        update_config
        ;;
    status)
        ./deploy.sh status
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
