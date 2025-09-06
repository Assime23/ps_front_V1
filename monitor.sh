#!/bin/bash

# Script de monitoring pour PS Frontend
# Usage: ./monitor.sh [start|stop|status|alerts]

set -e

# Configuration
MONITOR_DIR="monitoring"
LOG_FILE="$MONITOR_DIR/monitor.log"
PID_FILE="$MONITOR_DIR/monitor.pid"
ALERT_EMAIL="admin@psmyservices.com"  # Modifiez selon vos besoins

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [SUCCESS] $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARNING] $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $1" >> "$LOG_FILE"
}

# Initialiser le monitoring
init_monitoring() {
    mkdir -p "$MONITOR_DIR"
    touch "$LOG_FILE"
}

# Vérifier l'état du conteneur
check_container_health() {
    local container_name="ps_front_app"
    
    if ! docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        log_error "Conteneur $container_name non trouvé ou arrêté"
        return 1
    fi
    
    # Vérifier le health check Docker
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-health-check")
    
    case "$health_status" in
        "healthy")
            log_success "Conteneur en bonne santé"
            return 0
            ;;
        "unhealthy")
            log_error "Conteneur en mauvaise santé"
            return 1
            ;;
        "starting")
            log_info "Conteneur en cours de démarrage"
            return 2
            ;;
        *)
            log_warning "État de santé indéterminé: $health_status"
            return 2
            ;;
    esac
}

# Vérifier la connectivité HTTP
check_http_health() {
    local url="http://localhost:80/health"
    
    if docker-compose exec -T frontend curl -f -s --max-time 10 "$url" > /dev/null 2>&1; then
        log_success "Health check HTTP réussi"
        return 0
    else
        log_error "Health check HTTP échoué"
        return 1
    fi
}

# Vérifier l'utilisation des ressources
check_resources() {
    local container_name="ps_front_app"
    
    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        local stats=$(docker stats --no-stream --format "{{.CPUPerc}} {{.MemUsage}}" "$container_name" 2>/dev/null)
        
        if [ -n "$stats" ]; then
            local cpu=$(echo "$stats" | cut -d' ' -f1 | sed 's/%//')
            local mem=$(echo "$stats" | cut -d' ' -f2)
            
            log_info "Ressources - CPU: ${cpu}%, Mémoire: ${mem}"
            
            # Alertes sur l'utilisation
            if (( $(echo "$cpu > 80" | bc -l) )); then
                log_warning "Utilisation CPU élevée: ${cpu}%"
            fi
            
            return 0
        fi
    fi
    
    log_error "Impossible de récupérer les statistiques de ressources"
    return 1
}

# Vérifier les logs pour des erreurs
check_logs_for_errors() {
    local error_count=$(docker-compose logs --since="5m" frontend 2>&1 | grep -i -E "(error|fail|exception)" | wc -l)
    
    if [ "$error_count" -gt 0 ]; then
        log_warning "Détecté $error_count erreur(s) dans les logs des 5 dernières minutes"
        
        # Afficher les dernières erreurs
        docker-compose logs --since="5m" frontend 2>&1 | grep -i -E "(error|fail|exception)" | tail -5
        
        return 1
    else
        log_success "Aucune erreur détectée dans les logs récents"
        return 0
    fi
}

# Exécuter tous les checks
run_health_checks() {
    local overall_status=0
    
    log_info "=== Début des vérifications de santé ==="
    
    # Vérification du conteneur
    if ! check_container_health; then
        overall_status=1
    fi
    
    # Vérification HTTP
    if ! check_http_health; then
        overall_status=1
    fi
    
    # Vérification des ressources
    check_resources
    
    # Vérification des logs
    if ! check_logs_for_errors; then
        overall_status=1
    fi
    
    log_info "=== Fin des vérifications de santé ==="
    
    return $overall_status
}

# Envoyer une alerte
send_alert() {
    local message="$1"
    local severity="$2"
    
    log_warning "ALERTE [$severity]: $message"
    
    # Ici vous pouvez ajouter l'envoi d'email, Slack, etc.
    # Exemple avec mail (si disponible):
    # echo "$message" | mail -s "PS Frontend Alert [$severity]" "$ALERT_EMAIL"
    
    # Exemple avec curl vers un webhook Slack:
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"PS Frontend Alert [$severity]: $message\"}" \
    #   YOUR_SLACK_WEBHOOK_URL
}

# Démarrer le monitoring en continu
start_monitoring() {
    if [ -f "$PID_FILE" ]; then
        local existing_pid=$(cat "$PID_FILE")
        if kill -0 "$existing_pid" 2>/dev/null; then
            log_warning "Le monitoring est déjà en cours (PID: $existing_pid)"
            return 1
        else
            log_info "Nettoyage du PID file obsolète"
            rm -f "$PID_FILE"
        fi
    fi
    
    log_info "Démarrage du monitoring en arrière-plan..."
    
    # Fonction de monitoring en boucle
    monitor_loop() {
        while true; do
            if ! run_health_checks; then
                send_alert "Un ou plusieurs checks de santé ont échoué" "WARNING"
            fi
            
            sleep 60  # Vérifier toutes les minutes
        done
    }
    
    # Démarrer en arrière-plan
    monitor_loop &
    local monitor_pid=$!
    
    # Sauvegarder le PID
    echo "$monitor_pid" > "$PID_FILE"
    
    log_success "Monitoring démarré (PID: $monitor_pid)"
}

# Arrêter le monitoring
stop_monitoring() {
    if [ -f "$PID_FILE" ]; then
        local monitor_pid=$(cat "$PID_FILE")
        
        if kill -0 "$monitor_pid" 2>/dev/null; then
            kill "$monitor_pid"
            rm -f "$PID_FILE"
            log_success "Monitoring arrêté (PID: $monitor_pid)"
        else
            log_warning "Processus de monitoring introuvable"
            rm -f "$PID_FILE"
        fi
    else
        log_info "Aucun monitoring en cours"
    fi
}

# Afficher le statut du monitoring
show_monitoring_status() {
    if [ -f "$PID_FILE" ]; then
        local monitor_pid=$(cat "$PID_FILE")
        
        if kill -0 "$monitor_pid" 2>/dev/null; then
            log_success "Monitoring actif (PID: $monitor_pid)"
            
            # Afficher les dernières entrées du log
            if [ -f "$LOG_FILE" ]; then
                echo ""
                log_info "Dernières entrées du monitoring:"
                tail -10 "$LOG_FILE"
            fi
        else
            log_warning "Monitoring configuré mais processus introuvable"
            rm -f "$PID_FILE"
        fi
    else
        log_info "Aucun monitoring en cours"
    fi
    
    # Afficher l'état actuel du service
    echo ""
    run_health_checks
}

# Afficher les alertes récentes
show_alerts() {
    if [ -f "$LOG_FILE" ]; then
        log_info "Alertes et erreurs des dernières 24h:"
        grep -E "(ERROR|WARNING|ALERTE)" "$LOG_FILE" | tail -20
    else
        log_info "Aucun log d'alerte trouvé"
    fi
}

# Menu principal
case "${1:-status}" in
    start)
        init_monitoring
        start_monitoring
        ;;
    stop)
        stop_monitoring
        ;;
    status)
        init_monitoring
        show_monitoring_status
        ;;
    check)
        init_monitoring
        run_health_checks
        ;;
    alerts)
        show_alerts
        ;;
    help|--help|-h)
        echo "Script de monitoring PS Frontend"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  start     Démarrer le monitoring continu"
        echo "  stop      Arrêter le monitoring"
        echo "  status    Afficher l'état du monitoring et du service"
        echo "  check     Exécuter une vérification unique"
        echo "  alerts    Afficher les alertes récentes"
        echo "  help      Afficher cette aide"
        ;;
    *)
        log_error "Commande inconnue: $1"
        exit 1
        ;;
esac
