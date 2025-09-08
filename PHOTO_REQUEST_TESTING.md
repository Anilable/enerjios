# Photo Request System Testing Guide

## Complete Workflow Test

### 1. Admin Creates Photo Request
- **URL**: http://localhost:3004/dashboard/customers  
- **Login**: admin@trakyasolar.com / admin123
- **Steps**:
  1. Navigate to Customer Management page
  2. Find any customer in the list (e.g., "Ahmet Yılmaz")
  3. Click "Fotoğraf İste" button in the action buttons
  4. Fill out the modal form:
     - Engineer Name: Your name
     - Engineer Title: Mühendis (or custom)
     - Customer Email: Verify pre-filled email
     - Custom message gets generated
  5. Click "Gönder" to create photo request

### 2. Customer Receives Email & Uploads Photos
- **Email**: Check email specified in customer data
- **Alternative**: Use generated link from console logs
- **URL Format**: http://localhost:3004/photo-upload/[TOKEN]
- **Steps**:
  1. Click link from email or paste generated URL
  2. See personalized message from engineer
  3. Use drag & drop or "Kameradan Çek" button
  4. Upload photos (max 10MB each, JPG/PNG)
  5. Photos upload with progress indicators

### 3. Admin Reviews Photos
- **URL**: http://localhost:3004/dashboard/photo-requests
- **Steps**:
  1. Navigate to Photo Requests dashboard
  2. See statistics: Total requests, pending, completed, total photos
  3. Review uploaded photos in gallery
  4. Approve/reject photos with feedback
  5. Mark requests as complete

## Key Features Implemented

### ✅ Database Schema
- PhotoRequest model with all required fields
- PhotoUpload model for individual photos
- Relations to User, Customer, Project models
- Status tracking (PENDING, UPLOADED, REVIEWED, EXPIRED)

### ✅ Admin Interface
- "Fotoğraf İste" button in customer list
- Modal form with engineer info and message
- Photo requests dashboard with statistics
- Photo gallery with approve/reject functionality

### ✅ Public Upload Page
- Token-based secure access (no login required)
- Mobile-first responsive design
- Camera capture + file upload support
- Drag & drop interface
- File validation (type, size limits)
- Progress indicators
- 7-day expiry system

### ✅ Email System
- Personalized messages with engineer info
- Unique secure links with tokens
- Professional email templates
- Automatic expiry handling

### ✅ File Management
- Sharp image processing for thumbnails
- Secure file storage in /public/uploads
- File type and size validation
- Original filename preservation

### ✅ Security Features
- Token-based access (no authentication required for customers)
- Admin/Company role restrictions
- File type validation
- Size limits (10MB per file)
- Automatic token expiry

## Environment Variables Required

```
# Email sending
RESEND_API_KEY=re_3NA7BPDP_Lks892AjzNzeFtc6fB5UreQ5
FROM_EMAIL=info@trakyasolar.com

# Company info for messages
COMPANY_NAME=Trakya Solar

# NextAuth for admin access
NEXTAUTH_URL=http://localhost:3004
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
```

## Test Users Available

- **Admin**: admin@trakyasolar.com / admin123
- **Company Manager**: manager@trakyasolar.com / manager123  
- **Customer**: customer@trakyasolar.com / customer123
- **Farmer**: farmer@trakyasolar.com / farmer123

## Common Issues & Solutions

1. **No email received**: Check RESEND_API_KEY configuration
2. **Token expired**: Photo requests expire after 7 days
3. **Upload fails**: Check file size (max 10MB) and type (JPG/PNG only)
4. **Permission denied**: Ensure logged in as ADMIN or COMPANY role
5. **Database error**: Run `npx prisma db seed` to reset test data

## Development Notes

- Development server runs on http://localhost:3004
- Database: SQLite (`prisma/dev.db`)
- Photos stored in: `public/uploads/`
- Thumbnails automatically generated with Sharp
- All components have error boundaries for stability