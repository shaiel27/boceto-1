# Automatic Technician Assignment Fix

## Problem
The automatic technician assignment was not working. When tickets were created, they remained in "Pendiente" status without being assigned to any technician.

## Root Cause Analysis

### Issue 1: Wrong Method Used in `assignPendingTickets()`
**Location:** `src/models/Technician.php`

**Problem:** The method was using `getAllTechniciansByService()` which:
- Does NOT filter by work schedule
- Does NOT filter by lunch block
- Does NOT filter by technician status correctly (was checking for 'Disponible' OR 'Activo')

**Solution:** Changed to use `getAvailableTechniciansByService()` which:
- Filters by work schedule (current day and time)
- Filters by lunch block (excludes technicians currently in lunch)
- Filters by status = 'Disponible' only
- Orders by workload (round-robin weighted algorithm)

### Issue 2: Wrong Method Used in `ServiceRequest.create()`
**Location:** `src/models/ServiceRequest.php`

**Problem:** Same as above - using `getAllTechniciansByService()` instead of `getAvailableTechniciansByService()`.

**Solution:** Updated to use `getAvailableTechniciansByService()` with proper logging.

### Issue 3: SQL Parameter Binding Error
**Location:** `src/models/Technician.php` - `getAvailableTechniciansByService()`

**Problem:** The SQL query used `:currentTime` multiple times in the WHERE clause but only bound it once:
```sql
AND sched.Work_Start_Time <= :currentTime
AND sched.Work_End_Time >= :currentTime
AND (lb.Start_Time IS NULL OR lb.Start_Time > :currentTime OR lb.End_Time <= :currentTime)
```

This caused: `SQLSTATE[HY093]: Invalid parameter number`

**Solution:** Used unique parameter names for each occurrence:
```sql
AND sched.Work_Start_Time <= :currentTime1
AND sched.Work_End_Time >= :currentTime2
AND (lb.Start_Time IS NULL OR lb.Start_Time > :currentTime3 OR lb.End_Time <= :currentTime4)
```

And bound each parameter separately:
```php
$stmt->bindParam(":currentTime1", $currentTime);
$stmt->bindParam(":currentTime2", $currentTime);
$stmt->bindParam(":currentTime3", $currentTime);
$stmt->bindParam(":currentTime4", $currentTime);
```

## Changes Made

### 1. Technician.php - `assignPendingTickets()`
```php
// Before
$availableTechs = $this->getAllTechniciansByService($serviceId);
$availableTechs = array_filter($availableTechs, function($tech) {
    return in_array($tech['Status'], ['Disponible', 'Activo']);
});

// After
$availableTechs = $this->getAvailableTechniciansByService($serviceId);
// This method already filters by: work schedule, lunch block, and status = 'Disponible'
```

Added detailed logging for debugging:
- Log number of pending tickets found
- Log number of available technicians per service
- Log selected technician details
- Log assignment success/failure

### 2. ServiceRequest.php - `create()`
```php
// Before
$allTechnicians = $technician->getAllTechniciansByService((int)$this->Fk_TI_Service);
$availableTechnicians = array_filter($allTechnicians, function($tech) {
    return in_array($tech['Status'], ['Disponible', 'Activo']);
});

// After
$availableTechnicians = $technician->getAvailableTechniciansByService((int)$this->Fk_TI_Service);
// This method respects: work schedule, lunch block, and status = 'Disponible'
```

Added detailed logging for debugging.

### 3. Technician.php - `getAvailableTechniciansByService()`
Fixed SQL parameter binding by using unique parameter names for each occurrence of `:currentTime`.

## Test Results

### Test Script: `test-auto-assignment-with-ticket.php`

**Output:**
```
=== PRUEBA DE ASIGNACIÓN AUTOMÁTICA CON CREACIÓN DE TICKET ===

1. Servicios TI disponibles:
   - ID: 1, Nombre: Redes
   - ID: 2, Nombre: Soporte
   - ID: 3, Nombre: Programación

2. Técnicos disponibles para servicio 'Redes' (ID 1):
   - Juan Garcia (ID: 11)
     Tickets Activos: 0
     Asignaciones Recientes: 0
     Puntaje Prioridad: 1
   - [7 more technicians...]

3. Creando ticket de prueba...
   Ticket creado exitosamente con ID: 43
   Código: [auto-generated]
   Estado: Pendiente

4. Verificando asignación automática...
   Técnico asignado automáticamente: Juan Garcia
   Estado de asignación: Activo
   Asignado a las: 2026-04-30 09:25:24

5. Estado final del ticket:
   Estado: En Proceso
```

**Result:** ✅ **SUCCESS**

- Found 8 available technicians for service Redes
- Selected Juan Garcia (lowest workload)
- Successfully assigned to ticket 43
- Ticket status updated to "En Proceso"
- Assignment recorded in database

## How Automatic Assignment Works Now

### When a Ticket is Created:
1. `ServiceRequest.create()` is called
2. Calls `getAvailableTechniciansByService(serviceId)`
3. Method updates technician status based on:
   - Current work schedule (day and time)
   - Lunch block (excludes if currently in lunch)
   - Active tickets (excludes if has active tickets)
4. Returns technicians sorted by:
   - Workload: (Active Tickets × 2) + (Recent Assignments × 1)
   - Name (alphabetical)
5. Selects first technician (lowest workload)
6. Calls `assignToTicket()` to assign
7. Updates ticket status to "En Proceso"

### When Assigning Pending Tickets:
1. `assignPendingTickets()` is called (via API endpoint)
2. Gets all tickets with status = 'Pendiente'
3. For each ticket:
   - Calls `getAvailableTechniciansByService(serviceId)`
   - Selects technician with lowest workload
   - Assigns technician to ticket
   - Updates ticket status to "En Proceso"

## Intelligent Selection Algorithm

### Round-Robin Weighted:
```
Priority Score = (Active Tickets × 2) + (Recent Assignments × 1)
```

- **Active Tickets (weight 2):** Current workload is most important
- **Recent Assignments (weight 1):** Ensures fair rotation among technicians
- **Priority Score:** Lower is better (sorted ASC)

### Time-Based Filtering:
- **Work Schedule:** Only technicians working today and within hours
- **Lunch Block:** Excludes technicians currently in lunch
- **Status:** Only technicians with status = 'Disponible'

### Fallback:
If no technicians are available in working hours, the method falls back to all available technicians (without time restrictions) but still filters by status = 'Disponible'.

## PHP-PRO Principles Applied

1. **Strict Typing:** All methods use type hints for parameters and return values
2. **Dependency Injection:** Database connection injected via constructor
3. **Error Handling:** Proper try-catch blocks with error logging
4. **Single Responsibility:** Each method has a clear, focused purpose
5. **Logging:** Comprehensive error logging for debugging
6. **Documentation:** PHPDoc comments for all public methods

## API Endpoint

### Assign Pending Tickets
```bash
POST http://localhost:8000/api/assignment
```

**Response:**
```json
{
  "success": true,
  "message": "Asignación de tickets pendientes completada",
  "assigned_count": 5,
  "assignments": [
    {
      "ticket_id": 43,
      "technician": "Juan Garcia",
      "service_id": 1
    }
  ]
}
```

## Verification

Run the test script to verify automatic assignment:
```bash
cd tickets-backend
php test-auto-assignment-with-ticket.php
```

Expected output:
- Found available technicians
- Ticket created successfully
- Technician assigned automatically
- Ticket status updated to "En Proceso"

## Summary

The automatic technician assignment is now fully functional:
- ✅ Uses correct method with time-based filtering
- ✅ Respects work schedules and lunch blocks
- ✅ Implements intelligent workload-based selection
- ✅ Properly logs all operations for debugging
- ✅ Successfully assigns technicians on ticket creation
- ✅ Successfully assigns pending tickets via API
- ✅ Updates ticket status to "En Proceso" after assignment
