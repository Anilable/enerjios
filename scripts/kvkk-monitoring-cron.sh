#!/bin/bash

# KVKK Automated Monitoring Cron Script
# Bu script KVKK uyumluluk sisteminin otomatik monitoring görevlerini çalıştırır
# Crontab'a eklemek için: crontab -e

# Environment variables
APP_URL="http://localhost:3000"
LOG_FILE="/var/log/kvkk-monitoring.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log function
log() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

# Function to call API endpoint
call_api() {
    local endpoint=$1
    local data=$2
    local description=$3

    log "Starting: $description"

    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$APP_URL$endpoint" 2>&1)

    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS\:.*//g')

    if [ "$http_code" -eq 200 ]; then
        log "✅ SUCCESS: $description"
        echo -e "${GREEN}✅ $description - SUCCESS${NC}"
        return 0
    else
        log "❌ FAILED: $description (HTTP: $http_code)"
        log "Response: $body"
        echo -e "${RED}❌ $description - FAILED (HTTP: $http_code)${NC}"
        return 1
    fi
}

# Main monitoring function
run_monitoring() {
    echo -e "${YELLOW}🚀 KVKK Otomatik Monitoring Başlıyor...${NC}"
    log "=== KVKK Monitoring Started ==="

    local success_count=0
    local total_count=0

    # 1. Overdue applications check
    ((total_count++))
    if call_api "/api/admin/kvkk-scheduler" '{"action": "check_overdue_applications"}' "Süresi Geçen Başvuru Kontrolü"; then
        ((success_count++))
    fi

    # 2. Reminder applications check
    ((total_count++))
    if call_api "/api/admin/kvkk-scheduler" '{"action": "check_reminder_applications"}' "Hatırlatma Kontrolü"; then
        ((success_count++))
    fi

    # 3. Daily report (only run at 9 AM)
    current_hour=$(date +%H)
    if [ "$current_hour" -eq 9 ]; then
        ((total_count++))
        if call_api "/api/admin/kvkk-scheduler" '{"action": "send_daily_report"}' "Günlük Rapor Gönderimi"; then
            ((success_count++))
        fi
    fi

    # 4. Automated monitoring
    ((total_count++))
    if call_api "/api/admin/kvkk-scheduler" '{"action": "automated_monitoring"}' "Otomatik Monitoring"; then
        ((success_count++))
    fi

    # Summary
    echo ""
    log "=== Monitoring Summary ==="
    log "Total tasks: $total_count"
    log "Successful: $success_count"
    log "Failed: $((total_count - success_count))"

    if [ "$success_count" -eq "$total_count" ]; then
        echo -e "${GREEN}✅ Tüm monitoring görevleri başarılı${NC}"
        log "✅ All monitoring tasks completed successfully"
        return 0
    else
        echo -e "${YELLOW}⚠️  Bazı monitoring görevleri başarısız${NC}"
        log "⚠️ Some monitoring tasks failed"
        return 1
    fi
}

# Health check function
health_check() {
    echo -e "${YELLOW}🏥 Sistem Health Check...${NC}"

    # Check if application is running
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$APP_URL/api/health" 2>&1)
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ Uygulama çalışıyor${NC}"
        return 0
    else
        echo -e "${RED}❌ Uygulama erişilebilir değil (HTTP: $http_code)${NC}"
        log "❌ Application health check failed (HTTP: $http_code)"
        return 1
    fi
}

# Test function
test_system() {
    echo -e "${YELLOW}🧪 KVKK Sistem Testi...${NC}"

    call_api "/api/admin/kvkk-test" '{"testType": "comprehensive"}' "Kapsamlı Sistem Testi"
}

# Main script
case "$1" in
    "monitoring")
        run_monitoring
        ;;
    "health")
        health_check
        ;;
    "test")
        test_system
        ;;
    *)
        echo "Usage: $0 {monitoring|health|test}"
        echo ""
        echo "Commands:"
        echo "  monitoring - Run automated KVKK monitoring tasks"
        echo "  health     - Check application health"
        echo "  test       - Run comprehensive system test"
        echo ""
        echo "Cron Examples:"
        echo "# Her 30 dakikada monitoring"
        echo "*/30 * * * * /path/to/kvkk-monitoring-cron.sh monitoring"
        echo ""
        echo "# Her gün sabah 9'da günlük rapor"
        echo "0 9 * * * /path/to/kvkk-monitoring-cron.sh monitoring"
        echo ""
        echo "# Her saat health check"
        echo "0 * * * * /path/to/kvkk-monitoring-cron.sh health"
        exit 1
        ;;
esac

exit_code=$?
log "=== Script completed with exit code: $exit_code ==="
exit $exit_code