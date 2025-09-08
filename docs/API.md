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