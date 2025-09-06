#!/bin/bash

# Script de test de build local pour PS Frontend
# Usage: ./test-build.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Vérifier Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        return 1
    fi
    
    local node_version=$(node --version)
    log_info "Node.js version: $node_version"
    
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        return 1
    fi
    
    local npm_version=$(npm --version)
    log_info "npm version: $npm_version"
    
    return 0
}

# Vérifier package.json
check_package_json() {
    if [ ! -f "package.json" ]; then
        log_error "package.json non trouvé"
        return 1
    fi
    
    log_success "package.json trouvé"
    
    # Vérifier les scripts
    if ! grep -q '"build"' package.json; then
        log_error "Script 'build' non trouvé dans package.json"
        return 1
    fi
    
    log_success "Script 'build' trouvé"
    return 0
}

# Installer les dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    log_success "Dépendances installées"
}

# Configurer les variables d'environnement
setup_env() {
    log_info "Configuration des variables d'environnement..."
    
    # Utiliser .env.production s'il existe
    if [ -f ".env.production" ]; then
        log_info "Utilisation de .env.production"
    else
        log_warning ".env.production non trouvé, création d'un fichier temporaire"
        
        cat > .env.production << EOF
REACT_APP_API_URL=https://api1.psmyservices.com
REACT_APP_API_BASE_URL=https://api1.psmyservices.com/api
REACT_APP_NAME="Papou Service"
REACT_APP_DEBUG=false
EOF
    fi
    
    # Définir NODE_ENV
    export NODE_ENV=production
    
    log_success "Variables d'environnement configurées"
}

# Exécuter le build
run_build() {
    log_info "Exécution du build..."
    
    # Nettoyer le dossier dist s'il existe
    if [ -d "dist" ]; then
        rm -rf dist
        log_info "Ancien dossier dist supprimé"
    fi
    
    # Exécuter le build
    npm run build
    
    log_success "Build terminé"
}

# Vérifier le résultat du build
verify_build() {
    log_info "Vérification du build..."
    
    if [ ! -d "dist" ]; then
        log_error "Dossier dist non créé"
        return 1
    fi
    
    if [ ! -f "dist/index.html" ]; then
        log_error "index.html non trouvé dans dist"
        return 1
    fi
    
    # Afficher les fichiers créés
    log_info "Fichiers créés dans dist:"
    ls -la dist/
    
    # Vérifier la taille
    local build_size=$(du -sh dist | cut -f1)
    log_info "Taille du build: $build_size"
    
    log_success "Build vérifié avec succès"
    return 0
}

# Fonction principale
main() {
    log_info "🚀 Test de build local pour PS Frontend"
    echo
    
    # Vérifications préliminaires
    if ! check_node; then
        log_error "❌ Node.js/npm requis pour le test"
        exit 1
    fi
    
    if ! check_package_json; then
        log_error "❌ Configuration package.json invalide"
        exit 1
    fi
    
    # Installation et build
    install_dependencies
    setup_env
    run_build
    
    # Vérification
    if verify_build; then
        echo
        log_success "🎉 Test de build réussi!"
        log_info "Le build peut maintenant être utilisé par Docker"
        echo
        log_info "Pour déployer avec Docker, utilisez:"
        echo "   sudo ./deploy.sh deploy"
    else
        echo
        log_error "❌ Test de build échoué"
        exit 1
    fi
}

# Nettoyage en cas d'interruption
cleanup() {
    log_warning "Nettoyage en cours..."
    # Pas de nettoyage spécifique nécessaire pour un build local
}

trap cleanup EXIT

# Exécuter
main "$@"
