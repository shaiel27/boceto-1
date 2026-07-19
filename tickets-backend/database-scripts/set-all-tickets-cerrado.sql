UPDATE Service_Request
SET Status = 'Cerrado',
    Resolved_at = COALESCE(Resolved_at, NOW())
WHERE Status NOT IN ('Cerrado', 'Resuelto');
