<?php

namespace App\Http\Requests;

use App\Core\Request;

class StoreTicketRequest
{
    public static function validate(Request $request): array
    {
        return $request->validate([
            'fk_office' => 'required|integer',
            'fk_user_requester' => 'required|integer',
            'fk_ti_service' => 'required|integer',
            'fk_problem_catalog' => 'required|integer',
            'fk_boss_requester' => 'required|integer',
            'subject' => 'required|max:100',
            'system_priority' => 'required|in:Baja,Media,Alta',
            'description' => 'max:1000',
            'property_number' => 'max:10',
            'fk_software_system' => 'integer',
        ]);
    }
}
