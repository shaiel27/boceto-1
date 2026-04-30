# PHP-PRO Dashboard Integration

## Overview
Integration of the React Dashboard component with the PHP-PRO backend following strict typing, PSR standards, and modern PHP patterns.

## Architecture

### Backend (PHP-PRO)
- **Strict Types**: All PHP files use `declare(strict_types=1)`
- **DTOs**: Data Transfer Objects for type-safe data transfer
- **Controllers**: AdminDashboardController with optimized queries
- **Middleware**: JWT authentication with role-based access control
- **Database**: PDO with prepared statements for SQL injection prevention

### Frontend (React + TypeScript)
- **TypeScript Interfaces**: Strict typing for all data structures
- **API Service**: Centralized API calls with proper error handling
- **Authentication Context**: JWT token management
- **Data Transformation**: Backend-to-frontend data mapping

## Backend Endpoints

### Dashboard Endpoint
**URL**: `GET http://localhost:8000/api/dashboard?action=full`

**Authentication**: Required (Bearer JWT token)

**Response Format**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "pending_count": 5,
      "in_progress_count": 3,
      "resolved_count": 10,
      "critical_count": 2,
      "today_count": 1,
      "week_count": 5,
      "avg_resolution_hours": 4.5,
      "active_offices": 8,
      "active_technicians": 4,
      "total_tickets": 18,
      "resolution_rate": 55.56
    },
    "recent_tickets": [
      {
        "ID_Service_Request": 1,
        "Ticket_Code": "T-00001",
        "Subject": "Ticket subject",
        "System_Priority": "Alta",
        "Status": "Pendiente",
        "Created_at": "2024-01-15 10:30:00",
        "Office_Name": "Oficina Name",
        "Service_Name": "Service Type",
        "Technician_Names": "Technician Name",
        "Time_Ago": "2 horas"
      }
    ],
    "technician_performance": [
      {
        "ID_Technicians": 1,
        "technician_name": "Carlos Diaz",
        "Email": "carlos@alcaldia.gob",
        "assigned_tickets": 5,
        "resolved_tickets": 3,
        "avg_resolution_hours": 4.2,
        "active_tickets": 2
      }
    ],
    "priority_distribution": [...],
    "office_distribution": [...],
    "trends": [...],
    "service_distribution": [...],
    "last_updated": "2024-01-15 10:30:00"
  }
}
```

## Data Transformation

### Ticket Data Mapping
| Backend Field | Frontend Field | Type |
|--------------|----------------|------|
| `ID_Service_Request` | `id` | string |
| `Ticket_Code` | `id` | string |
| `Subject` | `subject` | string |
| `Office_Name` | `office` | string |
| `System_Priority` | `priority` | 'Alta' \| 'Media' \| 'Baja' |
| `Status` | `status` | 'Pendiente' \| 'En Proceso' \| 'Cerrado' |
| `Technician_Names` | `assignedTo` | string |
| `Created_at` | `date` | string |

### Technician Data Mapping
| Backend Field | Frontend Field | Type |
|--------------|----------------|------|
| `ID_Technicians` | `id` | number |
| `technician_name` | `name` | string |
| `Status` | `status` | 'available' \| 'busy' |
| `active_tickets` | `currentTickets` | number |
| `resolved_tickets` | `totalCompleted` | number |

## Authentication Flow

### 1. Login
```typescript
const response = await ApiService.login(email, password);
// Returns: { success: true, data: { token, user } }
```

### 2. Token Storage
```typescript
sessionStorage.setItem('auth_token', token);
```

### 3. Dashboard Request
```typescript
const response = await fetch('http://localhost:8000/api/dashboard?action=full', {
  headers: {
    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json',
  }
});
```

### 4. Backend Authentication
- JWT token validation in `AuthMiddleware.php`
- Role-based access control (Admin only for dashboard)
- User context set via `$_SERVER['AUTH_USER_ID']` and `$_SERVER['AUTH_USER_ROLE']`

## PHP-PRO Compliance

### Strict Typing
```php
<?php
declare(strict_types=1);

final class AdminDashboardController
{
    private \PDO $db;
    
    public function __construct(
        private \PDO $database,
    ) {
        $this->db = $database;
    }
}
```

### DTO Pattern
```php
final class DashboardStatsDTO
{
    public function __construct(
        public int $pendingCount,
        public int $inProgressCount,
        public int $resolvedCount,
        // ...
    ) {}
    
    public static function fromDatabaseRow(array $row): self
    {
        return new self(
            pendingCount: (int) ($row['pending_count'] ?? 0),
            // ...
        );
    }
}
```

### Prepared Statements
```php
$stmt = $this->db->prepare($query);
$stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
$stmt->execute();
```

## CORS Configuration

### Backend (index.php)
```php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
```

### Frontend (api.ts)
```typescript
const response = await fetch(`${API_BASE_URL}/api/dashboard?action=full`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json',
  }
});
```

## Error Handling

### Frontend
```typescript
try {
  const response = await fetch(/* ... */);
  const data = await response.json();
  
  if (data.success && data.data) {
    // Process data
  } else {
    console.error('Backend error:', data.message);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### Backend
```php
try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error de conexión a la base de datos'
        ]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
}
```

## Performance Optimizations

### Single Endpoint
- Dashboard uses `/api/dashboard?action=full` for all data
- Reduces HTTP requests from 3+ to 1
- Backend performs parallel data loading

### Database Queries
- Optimized SQL with single aggregations
- JOIN queries instead of multiple queries
- Proper indexing on foreign keys

### Auto-Refresh
- Frontend refreshes every 30 seconds
- Efficient data fetching with minimal payload

## Security

### JWT Authentication
- Secret key from environment variable
- Token expiration handling
- Role-based access control

### SQL Injection Prevention
- All queries use prepared statements
- Parameter binding with type hints
- Input validation and sanitization

### XSS Prevention
- Output encoding in PHP
- React's automatic XSS protection
- Content-Type headers

## Testing

### Manual Testing Steps
1. Start backend server: `php -S localhost:8000 -t public`
2. Start frontend: `npm start`
3. Login with admin credentials
4. Navigate to Dashboard
5. Verify data loads correctly
6. Check browser console for errors
7. Verify auto-refresh works

### Expected Behavior
- Dashboard loads with real data from database
- Stats match database counts
- Recent tickets display correctly
- Technicians show current status
- Auto-refresh updates data every 30 seconds

## Troubleshooting

### CORS Errors
- Verify CORS headers in `index.php`
- Check frontend origin matches `http://localhost:3000`

### Authentication Errors
- Verify JWT secret matches
- Check token is stored in sessionStorage
- Verify token is not expired

### Data Not Loading
- Check database connection
- Verify backend server is running
- Check browser network tab for failed requests
- Verify user has Admin role

### Empty Data
- Check database has test data
- Verify queries return results
- Check data transformation functions

## Database Schema Reference

### Key Tables
- `Service_Request` - Tickets data
- `Technicians` - Technician information
- `Ticket_Technicians` - Ticket assignments
- `Office` - Office/department data
- `TI_Service` - Service types
- `Users` - User accounts with roles

### Important Fields
- `Service_Request.System_Priority` - Ticket priority
- `Service_Request.Status` - Ticket status
- `Technicians.Status` - Technician availability
- `Ticket_Technicians.Is_Lead` - Lead technician flag

## Future Enhancements

### PHP-PRO Improvements
- Add PHPStan level 9 analysis
- Implement PHPUnit tests
- Add PSR-12 compliance checks
- Implement dependency injection container

### Frontend Improvements
- Add React Query for data caching
- Implement optimistic updates
- Add error boundaries
- Implement loading skeletons

### Performance
- Add Redis caching for dashboard data
- Implement WebSocket for real-time updates
- Add database query optimization
- Implement lazy loading for large datasets
