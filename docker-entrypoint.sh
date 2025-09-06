#!/bin/sh

# Script d'entrée pour le conteneur Nginx
set -e

echo "🚀 Démarrage du conteneur PS Frontend..."

# Vérifier que les fichiers sont bien présents
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    echo "❌ Erreur: Les fichiers de build ne sont pas présents!"
    exit 1
fi

echo "✅ Fichiers de build trouvés"

# Vérifier la configuration Nginx
nginx -t

echo "✅ Configuration Nginx valide"

# Afficher les informations de démarrage
echo "📋 Informations du conteneur:"
echo "   - Node.js version: $(node --version 2>/dev/null || echo 'Non disponible')"
echo "   - Nginx version: $(nginx -v 2>&1 | cut -d' ' -f3)"
echo "   - Utilisateur: $(whoami)"
echo "   - Répertoire web: /usr/share/nginx/html"
echo "   - Configuration: /etc/nginx/conf.d/default.conf"

# Lister les fichiers principaux
echo "📁 Fichiers principaux:"
ls -la /usr/share/nginx/html/ | head -10

echo "🌐 Démarrage de Nginx..."

# Exécuter la commande passée en paramètre
exec "$@"
