<?php

namespace App\Http\Requests;

use App\Core\Request;

class AssignTechnicianRequest
{
    public static function validate(Request $request): array
    {
        return $request->validate([
            'technician_ids' => 'required|array',
            'technician_ids.*' => 'integer',
            'roles' => 'array',
            'roles.*' => 'max:30',
        ]);
    }
}
