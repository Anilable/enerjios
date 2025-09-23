# 🌐 Trakya Solar API Documentation

Complete API reference for the Trakya Solar platform.

## Base URL
```
Production: https://trakyasolar.vercel.app/api
Development: http://localhost:3000/api
```

## Authentication

All protected endpoints require authentication via NextAuth.js session cookies.

### Authentication Endpoints

#### `POST /api/auth/signin`
User login endpoint.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "session": {
    "expires": "2024-12-31T23:59:59.999Z"
  }
}
```

#### `POST /api/auth/signout`
User logout endpoint.

#### `GET /api/auth/session`
Get current user session.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "expires": "2024-12-31T23:59:59.999Z"
}
```

## Projects API

### `GET /api/projects`
Get list of projects for authenticated user's company.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by project status
- `search` (optional): Search by project name

**Response:**
```json
{
  "projects": [
    {
      "id": "project_id",
      "name": "Solar Installation Project",
      "status": "IN_PROGRESS",
      "location": {
        "address": "123 Main St",
        "coordinates": [41.0082, 28.9784]
      },
      "systemSize": 10.5,
      "estimatedOutput": 12000,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### `POST /api/projects`
Create a new project.

**Request Body:**
```json
{
  "name": "New Solar Project",
  "customerId": "customer_id",
  "location": {
    "address": "123 Main St",
    "coordinates": [41.0082, 28.9784]
  },
  "systemSize": 10.5,
  "estimatedOutput": 12000,
  "estimatedCost": 15000
}
```

**Response:**
```json
{
  "id": "project_id",
  "name": "New Solar Project",
  "status": "PLANNING",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/projects/:id`
Get project details by ID.

**Response:**
```json
{
  "id": "project_id",
  "name": "Solar Installation Project",
  "status": "IN_PROGRESS",
  "customer": {
    "id": "customer_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "location": {
    "address": "123 Main St",
    "coordinates": [41.0082, 28.9784]
  },
  "systemSize": 10.5,
  "estimatedOutput": 12000,
  "actualOutput": 11800,
  "estimatedCost": 15000,
  "actualCost": 14500,
  "installationDate": "2024-03-15T00:00:00.000Z",
  "components": [
    {
      "type": "SOLAR_PANEL",
      "quantity": 30,
      "model": "SunPower X21-345"
    }
  ],
  "timeline": [
    {
      "phase": "Planning",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-15T00:00:00.000Z",
      "status": "COMPLETED"
    }
  ]
}
```

### `PUT /api/projects/:id`
Update project details.

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "status": "COMPLETED",
  "actualOutput": 11800,
  "actualCost": 14500
}
```

### `DELETE /api/projects/:id`
Delete a project.

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

## Reports API

### `GET /api/reports`
Get comprehensive business reports and analytics data.

**Query Parameters:**
- `type` (optional): Type of report to generate (default: 'sales-summary')
  - `sales-summary`: Sales trend analysis
  - `project-performance`: Project performance metrics
  - `customer-analytics`: Customer segmentation and analysis
  - `financial-overview`: Financial overview and metrics
  - `company-performance`: Company performance comparison (Admin only)
- `startDate` (optional): Start date for report data (ISO string)
- `endDate` (optional): End date for report data (ISO string)
- `groupBy` (optional): Data grouping method ('day', 'week', 'month')

**Authentication Required**: Yes
**Permissions Required**: `reports:read`

#### Sales Summary (`type=sales-summary`)
**Response:**
```json
{
  "data": [
    {
      "period": "15 Ocak 2024 - 21 Ocak 2024",
      "totalAmount": 125000,
      "count": 5
    }
  ],
  "summary": {
    "totalSales": 455000,
    "totalCount": 18,
    "averageValue": 25277.78
  }
}
```

#### Project Performance (`type=project-performance`)
**Response:**
```json
{
  "data": [
    {
      "id": "project_id",
      "name": "Solar Installation Project",
      "status": "COMPLETED",
      "systemSize": 10.5,
      "revenue": 125000,
      "cost": 85000,
      "profit": 40000,
      "profitability": 3809.52,
      "company": "Solar Tech Ltd"
    }
  ],
  "summary": {
    "totalProjects": 25,
    "totalCapacity": 267.5,
    "totalRevenue": 3125000,
    "totalProfit": 1250000
  }
}
```

#### Customer Analytics (`type=customer-analytics`)
**Response:**
```json
{
  "data": [
    {
      "id": "customer_id",
      "name": "Acme Solar Corp",
      "type": "COMPANY",
      "projectCount": 3,
      "totalValue": 375000,
      "averageProjectValue": 125000,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "summary": {
    "totalCustomers": 45,
    "individualCustomers": 32,
    "companyCustomers": 13,
    "repeatCustomers": 8,
    "totalValue": 2250000
  }
}
```

#### Financial Overview (`type=financial-overview`)
**Response:**
```json
{
  "data": {
    "totalRevenue": 455000,
    "totalProjects": 18,
    "activeProjects": 12,
    "completedProjects": 6,
    "systemCapacity": 189.5,
    "avgProjectSize": 10.53,
    "conversionRate": 75.5,
    "avgProjectValue": 25277.78
  },
  "chartData": [
    {
      "period": "15 Ocak 2024 - 21 Ocak 2024",
      "totalAmount": 125000,
      "count": 5
    }
  ]
}
```

#### Company Performance (`type=company-performance`, Admin only)
**Response:**
```json
{
  "data": [
    {
      "id": "company_id",
      "name": "Solar Tech Ltd",
      "projectCount": 12,
      "totalRevenue": 1500000,
      "totalCapacity": 126.5,
      "averageProjectValue": 125000,
      "averageProjectSize": 10.54
    }
  ],
  "summary": {
    "totalCompanies": 8,
    "totalRevenue": 4500000,
    "totalProjects": 45,
    "totalCapacity": 472.5
  }
}
```

### `GET /api/reports/export`
Export report data in various formats.

**Query Parameters:**
- `type` (required): Report type to export
- `format` (required): Export format ('excel' or 'pdf')
- `startDate` (optional): Start date for export data
- `endDate` (optional): End date for export data

**Authentication Required**: Yes
**Permissions Required**: `reports:export`

**Response:**
- **Excel format**: Returns CSV file for Excel compatibility
- **PDF format**: Returns PDF document (placeholder implementation)

## Finance API

### `GET /api/finance`
Get financial data and metrics for the authenticated user's company.

**Query Parameters:**
- `type` (optional): Type of financial data to retrieve (default: 'overview')
  - `overview`: Financial overview with key metrics
  - `invoices`: Invoice/quote data
  - `expenses`: Expense data from projects
  - `revenue`: Monthly revenue data for the last 6 months

**Authentication Required**: Yes
**Permissions Required**: `finance:read`

#### Financial Overview (`type=overview`)
**Response:**
```json
{
  "monthlyRevenue": 125000,
  "monthlyExpenses": 85000,
  "netProfit": 40000,
  "pendingAmount": 75000,
  "pendingCount": 8
}
```

#### Invoices (`type=invoices`)
**Response:**
```json
{
  "invoices": [
    {
      "id": "QT-2024-001",
      "customer": "Acme Solar Corp",
      "project": "Rooftop Solar Installation",
      "amount": 25000,
      "date": "2024-01-15",
      "dueDate": "2024-02-15",
      "status": "pending"
    }
  ]
}
```

#### Expenses (`type=expenses`)
**Response:**
```json
{
  "expenses": [
    {
      "id": "project_id",
      "category": "Proje Maliyeti",
      "description": "Solar Panel Installation",
      "amount": 15000,
      "date": "2024-01-15",
      "vendor": "Solar Components Ltd"
    }
  ]
}
```

#### Revenue Data (`type=revenue`)
**Response:**
```json
{
  "revenueData": [
    {
      "month": "Ocak",
      "revenue": 125000,
      "expenses": 85000,
      "profit": 40000
    },
    {
      "month": "Şubat",
      "revenue": 135000,
      "expenses": 90000,
      "profit": 45000
    }
  ]
}
```

## Reports API

### `GET /api/reports`
Get comprehensive business reports and analytics.

**Query Parameters:**
- `type` (required): Report type
  - `sales-summary`: Sales performance summary
  - `project-performance`: Project profitability analysis
  - `customer-analytics`: Customer behavior and value analysis
  - `financial-overview`: Financial metrics and KPIs
  - `company-performance`: Company comparison (admin only)
- `startDate` (optional): Start date for report data (ISO string)
- `endDate` (optional): End date for report data (ISO string)
- `groupBy` (optional): Data grouping period (day, week, month) - default: month

**Authentication Required**: Yes
**Permissions Required**: `reports:read`

#### Sales Summary (`type=sales-summary`)
**Response:**
```json
{
  "data": [
    {
      "period": "Ocak 2024",
      "totalAmount": 125000,
      "count": 8
    }
  ],
  "summary": {
    "totalSales": 750000,
    "totalCount": 45,
    "averageValue": 16667
  }
}
```

#### Project Performance (`type=project-performance`)
**Response:**
```json
{
  "data": [
    {
      "id": "project_id",
      "name": "Solar Installation Project",
      "status": "COMPLETED",
      "systemSize": 10.5,
      "revenue": 25000,
      "cost": 18000,
      "profit": 7000,
      "profitability": 667,
      "company": "Solar Tech Corp"
    }
  ],
  "summary": {
    "totalProjects": 25,
    "totalCapacity": 262.5,
    "totalRevenue": 625000,
    "totalProfit": 175000
  }
}
```

#### Customer Analytics (`type=customer-analytics`)
**Response:**
```json
{
  "data": [
    {
      "id": "customer_id",
      "name": "Acme Solar Corp",
      "type": "COMPANY",
      "projectCount": 3,
      "totalValue": 75000,
      "averageProjectValue": 25000,
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "summary": {
    "totalCustomers": 150,
    "individualCustomers": 120,
    "companyCustomers": 30,
    "repeatCustomers": 25,
    "totalValue": 1875000
  }
}
```

#### Financial Overview (`type=financial-overview`)
**Response:**
```json
{
  "data": {
    "totalRevenue": 125000,
    "totalProjects": 15,
    "activeProjects": 8,
    "completedProjects": 7,
    "systemCapacity": 157.5,
    "avgProjectSize": 10.5,
    "conversionRate": 75.5,
    "avgProjectValue": 8333
  },
  "chartData": [
    {
      "period": "15-21 Ocak 2024",
      "totalAmount": 25000,
      "count": 2
    }
  ]
}
```

#### Company Performance (`type=company-performance`) - Admin Only
**Response:**
```json
{
  "data": [
    {
      "id": "company_id",
      "name": "Solar Tech Corp",
      "projectCount": 25,
      "totalRevenue": 625000,
      "totalCapacity": 262.5,
      "averageProjectValue": 25000,
      "averageProjectSize": 10.5
    }
  ],
  "summary": {
    "totalCompanies": 12,
    "totalRevenue": 2500000,
    "totalProjects": 150,
    "totalCapacity": 1575
  }
}
```

## Analytics API

### `GET /api/analytics/overview`
Get dashboard overview metrics.

**Query Parameters:**
- `startDate` (optional): Start date for metrics (ISO string)
- `endDate` (optional): End date for metrics (ISO string)
- `companyId` (optional): Company ID (admin only)

**Response:**
```json
{
  "totalProjects": 150,
  "activeProjects": 45,
  "completedProjects": 105,
  "totalCapacity": 2500.5,
  "totalOutput": 3000000,
  "totalSavings": 450000,
  "averageROI": 15.5,
  "monthlyGrowth": 8.2,
  "recentActivity": [
    {
      "type": "PROJECT_COMPLETED",
      "projectId": "project_id",
      "projectName": "Solar Project #1",
      "date": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

### `GET /api/analytics/performance`
Get system performance metrics.

**Query Parameters:**
- `projectId` (optional): Filter by specific project
- `period` (optional): Time period (day, week, month, year)
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:**
```json
{
  "energyProduction": [
    {
      "date": "2024-01-01",
      "production": 250.5,
      "capacity": 300,
      "efficiency": 83.5
    }
  ],
  "financialMetrics": {
    "totalSavings": 45000,
    "monthlyRevenue": 3500,
    "roi": 15.2,
    "paybackPeriod": 6.8
  },
  "systemHealth": {
    "overallStatus": "EXCELLENT",
    "activeSystems": 45,
    "systemsWithIssues": 2,
    "maintenanceRequired": 1
  }
}
```

### `GET /api/analytics/financial`
Get financial analytics and ROI calculations.

**Response:**
```json
{
  "totalInvestment": 750000,
  "totalRevenue": 112500,
  "netSavings": 67500,
  "roi": 15.0,
  "averagePaybackPeriod": 6.7,
  "monthlyBreakdown": [
    {
      "month": "2024-01",
      "revenue": 8500,
      "savings": 6200,
      "costs": 1200
    }
  ],
  "projectedMetrics": {
    "nextMonthRevenue": 9200,
    "yearEndROI": 18.5,
    "fiveYearProjection": 425000
  }
}
```

## User Settings API

### `GET /api/user/settings`
Get user settings and preferences.

**Authentication Required**: Yes

**Response:**
```json
{
  "phone": "+90-555-123-4567",
  "company": "Solar Tech Ltd",
  "notifications": {
    "email": true,
    "projectUpdates": true,
    "payments": false,
    "weather": true
  },
  "security": {
    "twoFactorEnabled": false
  },
  "preferences": {
    "darkMode": false,
    "language": "tr",
    "timezone": "Europe/Istanbul"
  }
}
```

### `PUT /api/user/profile`
Update user profile information.

**Authentication Required**: Yes

**Request Body:**
```json
{
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "email": "ahmet@example.com",
  "phone": "+90-555-123-4567",
  "company": "Solar Energy Corp"
}
```

**Response:**
```json
{
  "message": "Profil bilgileri güncellendi"
}
```

### `PUT /api/user/notifications`
Update notification preferences.

**Authentication Required**: Yes

**Request Body:**
```json
{
  "email": true,
  "projectUpdates": true,
  "payments": false,
  "weather": true
}
```

**Response:**
```json
{
  "message": "Bildirim ayarları başarıyla güncellendi"
}
```

### `PUT /api/user/preferences`
Update system preferences.

**Authentication Required**: Yes

**Request Body:**
```json
{
  "darkMode": false,
  "language": "tr",
  "timezone": "Europe/Istanbul"
}
```

**Response:**
```json
{
  "message": "Sistem tercihleri başarıyla güncellendi"
}
```

### `PUT /api/user/password`
Change user password.

**Authentication Required**: Yes

**Request Body:**
```json
{
  "currentPassword": "current_password",
  "newPassword": "new_password"
}
```

**Response:**
```json
{
  "message": "Şifre başarıyla değiştirildi"
}
```

**Error Response:**
```json
{
  "error": "Mevcut şifre yanlış"
}
```

## Customers API

### `GET /api/customers`
Get list of customers.

**Response:**
```json
{
  "customers": [
    {
      "id": "customer_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0123",
      "address": "123 Main St",
      "projectsCount": 3,
      "totalCapacity": 31.5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### `POST /api/customers`
Create a new customer.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0124",
  "address": "456 Oak Ave",
  "company": "Green Energy Co"
}
```

## System Data API

### `GET /api/system-data`
Get real-time system data.

**Query Parameters:**
- `projectId`: Project ID
- `startDate` (optional): Start date
- `endDate` (optional): End date
- `resolution` (optional): Data resolution (minute, hour, day)

**Response:**
```json
{
  "realTimeData": {
    "currentOutput": 8.5,
    "dailyOutput": 45.2,
    "efficiency": 87.3,
    "temperature": 25.5,
    "irradiance": 850,
    "lastUpdated": "2024-01-15T14:30:00.000Z"
  },
  "historicalData": [
    {
      "timestamp": "2024-01-15T14:00:00.000Z",
      "power": 8.2,
      "energy": 0.5,
      "efficiency": 86.8
    }
  ],
  "alerts": [
    {
      "type": "LOW_EFFICIENCY",
      "message": "Panel efficiency below threshold",
      "severity": "WARNING",
      "timestamp": "2024-01-15T14:25:00.000Z"
    }
  ]
}
```

## Notifications API

### `GET /api/notifications`
Get user notifications.

**Response:**
```json
{
  "notifications": [
    {
      "id": "notification_id",
      "type": "SYSTEM_ALERT",
      "title": "System Maintenance Required",
      "message": "Solar panel cleaning recommended for optimal performance",
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### `PUT /api/notifications/:id/read`
Mark notification as read.

## Weather API

### `GET /api/weather`
Get weather data for projects.

**Query Parameters:**
- `lat`: Latitude
- `lng`: Longitude
- `projectId` (optional): Project ID for stored location

**Response:**
```json
{
  "current": {
    "temperature": 25.5,
    "humidity": 65,
    "windSpeed": 12,
    "cloudCover": 15,
    "irradiance": 850,
    "uvIndex": 6
  },
  "forecast": [
    {
      "date": "2024-01-16",
      "temperature": {
        "min": 18,
        "max": 27
      },
      "cloudCover": 20,
      "estimatedOutput": 42.5
    }
  ]
}
```

## Breaking Changes

### User Settings Architecture Change

**Effective Date**: Current Version

The user settings system has been redesigned for better performance:

- **Removed**: `settings` JSON field from User model
- **Added**: Hybrid storage approach (client-side + server-side)
- **Impact**: User Settings API endpoints now return structured data
- **Migration**: Existing user preferences will use default values

**Client-Side Storage** (localStorage):
- Theme preferences
- Language selection  
- Dashboard layout
- UI customizations

**Server-Side Storage** (Database):
- Security settings
- Notification preferences
- Company settings

## Error Handling

All API endpoints return consistent error responses:

**Error Response Format:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details if available"
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

API endpoints are rate limited:
- General endpoints: 100 requests per minute
- Authentication endpoints: 10 requests per minute
- File upload endpoints: 20 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## Webhooks

### Project Status Updates
Webhook payload for project status changes:

```json
{
  "event": "project.status.updated",
  "data": {
    "projectId": "project_id",
    "oldStatus": "IN_PROGRESS",
    "newStatus": "COMPLETED",
    "timestamp": "2024-01-15T15:00:00.000Z"
  }
}
```

### System Alerts
Webhook payload for system alerts:

```json
{
  "event": "system.alert.created",
  "data": {
    "alertId": "alert_id",
    "type": "LOW_EFFICIENCY",
    "severity": "WARNING",
    "projectId": "project_id",
    "message": "Panel efficiency below threshold",
    "timestamp": "2024-01-15T15:00:00.000Z"
  }
}
```

## SDK Examples

### JavaScript/Node.js
```javascript
import { TrakyaSolarAPI } from '@trakya-solar/sdk'

const api = new TrakyaSolarAPI({
  baseUrl: 'https://trakyasolar.vercel.app/api',
  apiKey: 'your-api-key'
})

// Get projects
const projects = await api.projects.list()

// Create project
const newProject = await api.projects.create({
  name: 'New Solar Project',
  customerId: 'customer_id',
  systemSize: 10.5
})
```

### Python
```python
from trakya_solar import TrakyaSolarAPI

api = TrakyaSolarAPI(
    base_url='https://trakyasolar.vercel.app/api',
    api_key='your-api-key'
)

# Get analytics
analytics = api.analytics.overview()
print(f"Total projects: {analytics['totalProjects']}")
```

---

For more information, see the [main documentation](../README.md) or contact our support team.