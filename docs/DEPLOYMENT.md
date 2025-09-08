# 🚀 Deployment Guide - Trakya Solar

Comprehensive deployment guide for production environments.

## Overview

Trakya Solar supports multiple deployment strategies:
- **Vercel** (Recommended for Next.js apps)
- **Docker** (Self-hosted or cloud containers)
- **Manual Server Deployment**

## Prerequisites

### System Requirements
- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+ (optional, for caching)
- Nginx (for reverse proxy)
- SSL certificate

### Environment Setup
All deployment methods require proper environment configuration.

## Vercel Deployment (Recommended)

### Quick Deploy
1. **Connect Repository**
   ```bash
   # Fork or clone the repository
   git clone <your-repo-url>
   cd trakya-solar
   ```

2. **Deploy to Vercel**
   - Connect your repository to Vercel
   - Import the project
   - Configure environment variables
   - Deploy automatically

### Environment Variables
Configure these in Vercel dashboard:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/trakyasolar

# Authentication
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key

# External APIs
MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token

# Redis (optional)
REDIS_URL=redis://user:password@host:6379

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
```

### Custom Domain Setup
1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records

2. **SSL Certificate**
   - Vercel automatically provides SSL certificates
   - Custom certificates can be uploaded if needed

### Build Configuration
The `vercel.json` file is pre-configured with optimizations:
- Static file caching
- Security headers
- API route configuration
- Cron job setup

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Prepare Environment**
   ```bash
   # Create production environment file
   cp .env.example .env.production
   
   # Edit environment variables
   nano .env.production
   ```

2. **Configure Environment**
   ```env
   # .env.production
   NODE_ENV=production
   
   # Database
   DATABASE_URL=postgresql://trakyasolar:password@db:5432/trakyasolar
   DB_USER=trakyasolar
   DB_PASSWORD=secure_password
   
   # Authentication
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=your-super-secret-key
   
   # Redis
   REDIS_URL=redis://:redis_password@redis:6379
   REDIS_PASSWORD=redis_password
   
   # External APIs
   MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token
   ```

3. **Deploy Stack**
   ```bash
   # Build and start services
   docker-compose up -d
   
   # Check service status
   docker-compose ps
   
   # View logs
   docker-compose logs -f app
   ```

4. **Initialize Database**
   ```bash
   # Run database migrations
   docker-compose exec app npx prisma migrate deploy
   
   # Seed initial data
   docker-compose exec app npx prisma db seed
   ```

### Single Container Deployment

1. **Build Image**
   ```bash
   # Build production image
   docker build -t trakya-solar .
   
   # Run container
   docker run -d \
     --name trakya-solar \
     -p 3000:3000 \
     -e DATABASE_URL="postgresql://..." \
     -e NEXTAUTH_SECRET="..." \
     trakya-solar
   ```

### Docker Swarm / Kubernetes

For advanced orchestration, see the `k8s/` directory for Kubernetes manifests.

## Manual Server Deployment

### Server Preparation

1. **Install Dependencies**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install -y nodejs npm postgresql redis-server nginx certbot
   
   # CentOS/RHEL
   sudo yum install -y nodejs npm postgresql-server redis nginx certbot
   ```

2. **Create Application User**
   ```bash
   sudo useradd -m -s /bin/bash trakyasolar
   sudo usermod -aG sudo trakyasolar
   ```

### Application Setup

1. **Clone Repository**
   ```bash
   sudo -u trakyasolar bash
   cd /home/trakyasolar
   git clone <repository-url> trakya-solar
   cd trakya-solar
   ```

2. **Install Dependencies**
   ```bash
   npm ci --production
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.production
   nano .env.production
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Setup Process Manager**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Create PM2 config
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'trakya-solar',
       script: 'server.js',
       cwd: '/home/trakyasolar/trakya-solar',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   EOF
   
   # Start application
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

### Database Setup

1. **Install PostgreSQL**
   ```bash
   sudo -u postgres createuser trakyasolar
   sudo -u postgres createdb trakyasolar -O trakyasolar
   sudo -u postgres psql -c "ALTER USER trakyasolar PASSWORD 'secure_password';"
   ```

2. **Run Migrations**
   ```bash
   cd /home/trakyasolar/trakya-solar
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Nginx Configuration

1. **Create Site Configuration**
   ```bash
   sudo nano /etc/nginx/sites-available/trakya-solar
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       location /.well-known/acme-challenge/ {
           root /var/www/html;
       }
       
       location / {
           return 301 https://$server_name$request_uri;
       }
   }
   
   server {
       listen 443 ssl http2;
       server_name your-domain.com www.your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       # Security headers
       add_header X-Frame-Options DENY;
       add_header X-Content-Type-Options nosniff;
       add_header X-XSS-Protection "1; mode=block";
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Static files
       location /_next/static {
           proxy_pass http://localhost:3000;
           add_header Cache-Control "public, max-age=31536000, immutable";
       }
   }
   ```

2. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/trakya-solar /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **SSL Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

## Database Migrations

### Production Migration Strategy

1. **Backup Database**
   ```bash
   pg_dump trakyasolar > backup-$(date +%Y%m%d-%H%M%S).sql
   ```

2. **Run Migrations**
   ```bash
   # Check migration status
   npx prisma migrate status
   
   # Apply migrations
   npx prisma migrate deploy
   
   # Verify schema
   npx prisma db pull
   ```

3. **Rollback Strategy**
   ```bash
   # If migration fails, restore from backup
   psql trakyasolar < backup-20240115-140000.sql
   ```

## Monitoring & Health Checks

### Health Check Endpoint
The application includes a health check endpoint at `/api/health`:

```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T15:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Monitoring Setup

1. **Application Monitoring**
   ```bash
   # PM2 monitoring
   pm2 monit
   
   # Resource usage
   pm2 show trakya-solar
   ```

2. **Database Monitoring**
   ```sql
   -- Check active connections
   SELECT count(*) FROM pg_stat_activity;
   
   -- Check database size
   SELECT pg_size_pretty(pg_database_size('trakyasolar'));
   ```

3. **Log Monitoring**
   ```bash
   # Application logs
   pm2 logs trakya-solar
   
   # Nginx logs
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

## Backup Strategy

### Database Backup
```bash
#!/bin/bash
# /home/trakyasolar/scripts/backup-db.sh

BACKUP_DIR="/home/trakyasolar/backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/trakyasolar-$DATE.sql"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump trakyasolar > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### Automated Backups
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /home/trakyasolar/scripts/backup-db.sh

# Weekly backup to external storage
0 1 * * 0 /home/trakyasolar/scripts/backup-to-s3.sh
```

## Security Considerations

### Firewall Configuration
```bash
# UFW configuration
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### SSL/TLS Configuration
- Use TLS 1.3 minimum
- Implement HSTS
- Configure proper cipher suites
- Regular certificate renewal

### Database Security
```sql
-- Create read-only user for monitoring
CREATE USER monitor WITH PASSWORD 'monitor_password';
GRANT CONNECT ON DATABASE trakyasolar TO monitor;
GRANT USAGE ON SCHEMA public TO monitor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitor;
```

## Performance Optimization

### Application Level
- Enable Next.js compression
- Configure proper caching headers
- Use CDN for static assets
- Implement database connection pooling

### Server Level
- Configure Nginx compression
- Enable HTTP/2
- Optimize PostgreSQL settings
- Redis memory optimization

### Monitoring Performance
```bash
# Check application metrics
curl https://your-domain.com/api/metrics

# Database performance
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **Application Won't Start**
   ```bash
   # Check logs
   pm2 logs trakya-solar --lines 100
   
   # Check environment
   pm2 show trakya-solar
   ```

2. **Database Connection Issues**
   ```bash
   # Test connection
   psql -h localhost -U trakyasolar -d trakyasolar
   
   # Check PostgreSQL status
   sudo systemctl status postgresql
   ```

3. **Memory Issues**
   ```bash
   # Check memory usage
   free -h
   pm2 monit
   
   # Restart application
   pm2 restart trakya-solar
   ```

4. **SSL Certificate Issues**
   ```bash
   # Check certificate
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

### Emergency Procedures

1. **Rollback Deployment**
   ```bash
   # Git rollback
   git reset --hard previous-commit-hash
   npm run build
   pm2 restart trakya-solar
   ```

2. **Database Recovery**
   ```bash
   # Restore from backup
   psql trakyasolar < backup-file.sql
   ```

3. **Scale Resources**
   ```bash
   # Add more PM2 instances
   pm2 scale trakya-solar +2
   ```

## Maintenance

### Regular Tasks
- Weekly: Review logs and performance
- Monthly: Update dependencies
- Quarterly: Security audit
- Annually: Infrastructure review

### Update Procedure
1. Backup database and application
2. Test updates in staging
3. Schedule maintenance window
4. Apply updates
5. Verify functionality
6. Monitor post-deployment

---

For additional support, contact the development team or refer to the [API Documentation](API.md).