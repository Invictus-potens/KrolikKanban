#!/bin/bash

# KrolikKanban SSL Certificate Renewal Script
# This script should be run via cron job

# Configuration
DOMAIN="krolikkanban.example.com"
EMAIL="your-email@example.com"
WEBROOT="/var/www/html"
CERTBOT="/usr/bin/certbot"
NGINX="/usr/sbin/nginx"
LOG_FILE="/var/log/krolikkanban/cert-renewal.log"

# Create log directory if it doesn't exist
mkdir -p /var/log/krolikkanban

# Log function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Check if certificate needs renewal
check_renewal() {
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        # Check if certificate expires in less than 30 days
        EXPIRY=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" | cut -d= -f2)
        EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
        CURRENT_EPOCH=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
        
        if [ $DAYS_LEFT -lt 30 ]; then
            log "Certificate expires in $DAYS_LEFT days. Renewing..."
            return 0
        else
            log "Certificate is valid for $DAYS_LEFT more days. No renewal needed."
            return 1
        fi
    else
        log "Certificate not found. Creating new certificate..."
        return 0
    fi
}

# Renew certificate
renew_certificate() {
    log "Starting certificate renewal process..."
    
    # Stop nginx temporarily
    log "Stopping nginx..."
    systemctl stop nginx
    
    # Create webroot directory if it doesn't exist
    mkdir -p "$WEBROOT/.well-known/acme-challenge"
    
    # Run certbot
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        # Renew existing certificate
        log "Renewing existing certificate..."
        $CERTBOT renew --quiet --webroot --webroot-path="$WEBROOT" --email="$EMAIL" --agree-tos --non-interactive
    else
        # Create new certificate
        log "Creating new certificate..."
        $CERTBOT certonly --webroot --webroot-path="$WEBROOT" --email="$EMAIL" --agree-tos --non-interactive -d "$DOMAIN"
    fi
    
    # Check if renewal was successful
    if [ $? -eq 0 ]; then
        log "Certificate renewal successful!"
        
        # Test nginx configuration
        log "Testing nginx configuration..."
        if $NGINX -t; then
            log "Nginx configuration is valid. Starting nginx..."
            systemctl start nginx
            
            # Check if nginx started successfully
            if systemctl is-active --quiet nginx; then
                log "Nginx started successfully!"
            else
                log "ERROR: Failed to start nginx!"
                exit 1
            fi
        else
            log "ERROR: Invalid nginx configuration!"
            exit 1
        fi
    else
        log "ERROR: Certificate renewal failed!"
        systemctl start nginx  # Try to start nginx anyway
        exit 1
    fi
}

# Main execution
main() {
    log "Starting SSL certificate renewal check..."
    
    # Check if certbot is installed
    if [ ! -f "$CERTBOT" ]; then
        log "ERROR: Certbot not found at $CERTBOT"
        exit 1
    fi
    
    # Check if nginx is installed
    if [ ! -f "$NGINX" ]; then
        log "ERROR: Nginx not found at $NGINX"
        exit 1
    fi
    
    # Check if renewal is needed
    if check_renewal; then
        renew_certificate
    fi
    
    log "SSL certificate renewal check completed."
}

# Run main function
main "$@"