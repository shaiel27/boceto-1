<?php

namespace App\Http\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Application\Technician\FindAvailableTechniciansHandler;
use App\Application\Technician\SyncAvailabilityHandler;
use App\Domain\Technician\TechnicianSchedule;
use RuntimeException;

class TechnicianController
{
    private FindAvailableTechniciansHandler $findHandler;
    private SyncAvailabilityHandler $syncHandler;

    public function __construct(
        FindAvailableTechniciansHandler $findHandler,
        SyncAvailabilityHandler $syncHandler
    ) {
        $this->findHandler = $findHandler;
        $this->syncHandler = $syncHandler;
    }

    public function index(Request $request): Response
    {
        try {
            $result = $this->findHandler->handle(
                (int)$request->query('service_id'),
                (int)$request->query('office_id')
            );

            return Response::success($result, 'Técnicos disponibles encontrados');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function available(Request $request): Response
    {
        $errors = $request->validate([
            'service_id' => 'required|integer',
            'office_id' => 'required|integer',
        ]);

        if (!empty($errors)) {
            return Response::validationError($errors);
        }

        try {
            $result = $this->findHandler->handle(
                (int)$request->get('service_id'),
                (int)$request->get('office_id')
            );

            return Response::success($result, 'Técnicos disponibles encontrados');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function show(Request $request): Response
    {
        $technicianId = (int)$request->getParam('id');

        try {
            $result = $this->syncHandler->handle($technicianId);
            return Response::success($result, 'Disponibilidad del técnico obtenida');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function updateSchedule(Request $request): Response
    {
        $technicianId = (int)$request->getParam('id');
        
        $errors = $request->validate([
            'schedules' => 'required|array',
            'schedules.*.day_of_week' => 'required|in:Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo',
            'schedules.*.work_start_time' => 'required',
            'schedules.*.work_end_time' => 'required',
        ]);

        if (!empty($errors)) {
            return Response::validationError($errors);
        }

        try {
            $schedules = [];
            foreach ($request->get('schedules') as $scheduleData) {
                $schedule = new TechnicianSchedule(
                    null,
                    $technicianId,
                    $scheduleData['day_of_week'],
                    $scheduleData['work_start_time'],
                    $scheduleData['work_end_time']
                );
                $schedules[] = $schedule;
            }

            return Response::success($schedules, 'Horario actualizado exitosamente');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }
}
