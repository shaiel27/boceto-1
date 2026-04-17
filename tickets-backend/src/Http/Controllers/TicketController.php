<?php

namespace App\Http\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Application\Ticket\CreateTicketHandler;
use App\Application\Ticket\AssignTechnicianHandler;
use App\Application\Ticket\UpdateStatusHandler;
use App\Application\Ticket\ListTicketsQuery;
use App\Domain\Ticket\Comment;
use App\Domain\Ticket\Attachment;
use RuntimeException;

class TicketController
{
    private CreateTicketHandler $createHandler;
    private AssignTechnicianHandler $assignHandler;
    private UpdateStatusHandler $updateHandler;
    private ListTicketsQuery $listHandler;

    public function __construct(
        CreateTicketHandler $createHandler,
        AssignTechnicianHandler $assignHandler,
        UpdateStatusHandler $updateHandler,
        ListTicketsQuery $listHandler
    ) {
        $this->createHandler = $createHandler;
        $this->assignHandler = $assignHandler;
        $this->updateHandler = $updateHandler;
        $this->listHandler = $listHandler;
    }

    public function index(Request $request): Response
    {
        $filters = [];
        
        if ($request->query('status')) {
            $filters['status'] = $request->query('status');
        }
        if ($request->query('office')) {
            $filters['office'] = (int)$request->query('office');
        }
        if ($request->query('priority')) {
            $filters['priority'] = $request->query('priority');
        }

        $page = (int)($request->query('page', 1));
        $perPage = (int)($request->query('per_page', 50));

        try {
            $result = $this->listHandler->handle($filters, $page, $perPage);
            return Response::success($result, 'Tickets listados exitosamente');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function show(Request $request): Response
    {
        $ticketId = (int)$request->getParam('id');
        
        try {
            $result = $this->listHandler->handle(['id' => $ticketId], 1, 1);
            
            if (empty($result['data'])) {
                return Response::notFound('Ticket no encontrado');
            }

            return Response::success($result['data'][0], 'Ticket encontrado');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function store(Request $request): Response
    {
        $errors = $request->validate([
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

        if (!empty($errors)) {
            return Response::validationError($errors);
        }

        try {
            $ticket = $this->createHandler->handle(
                $request->getBody(),
                $request->getUserId()
            );

            return Response::created($ticket->toArray(), 'Ticket creado exitosamente');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function assign(Request $request): Response
    {
        $ticketId = (int)$request->getParam('id');
        
        $errors = $request->validate([
            'technician_ids' => 'required',
            'roles' => 'array',
        ]);

        if (!empty($errors)) {
            return Response::validationError($errors);
        }

        $technicianIds = $request->get('technician_ids');
        if (!is_array($technicianIds)) {
            $technicianIds = [$technicianIds];
        }

        $roles = $request->get('roles', []);

        try {
            $assignments = $this->assignHandler->handle(
                $ticketId,
                $technicianIds,
                $request->getUserId(),
                $roles
            );

            return Response::success($assignments, 'Técnicos asignados exitosamente');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function updateStatus(Request $request): Response
    {
        $ticketId = (int)$request->getParam('id');
        
        $errors = $request->validate([
            'status' => 'required|in:Pendiente,Asignado,En Proceso,Resuelto,Cerrado',
            'resolution_notes' => 'max:1000',
        ]);

        if (!empty($errors)) {
            return Response::validationError($errors);
        }

        try {
            $ticket = $this->updateHandler->handle(
                $ticketId,
                $request->get('status'),
                $request->getUserId(),
                $request->get('resolution_notes')
            );

            return Response::success($ticket->toArray(), 'Estado actualizado exitosamente');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function addComment(Request $request): Response
    {
        $ticketId = (int)$request->getParam('id');
        
        $errors = $request->validate([
            'comment' => 'required|max:1000',
        ]);

        if (!empty($errors)) {
            return Response::validationError($errors);
        }

        try {
            $comment = new Comment(
                null,
                $ticketId,
                $request->getUserId(),
                $request->get('comment')
            );

            return Response::success($comment->toArray(), 'Comentario agregado exitosamente');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function uploadAttachment(Request $request): Response
    {
        $ticketId = (int)$request->getParam('id');
        $file = $request->file('attachment');

        if ($file === null) {
            return Response::validationError(['attachment' => 'Archivo requerido']);
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            return Response::error('Error al subir archivo', 400);
        }

        try {
            $fileName = $file['name'];
            $filePath = $this->storeFile($file);

            $attachment = new Attachment(
                null,
                $ticketId,
                $fileName,
                $filePath
            );

            return Response::success($attachment->toArray(), 'Archivo subido exitosamente');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function timeline(Request $request): Response
    {
        $ticketId = (int)$request->getParam('id');

        try {
            $result = $this->listHandler->handle(['id' => $ticketId], 1, 1);
            
            if (empty($result['data'])) {
                return Response::notFound('Ticket no encontrado');
            }

            return Response::success($result['data'][0]['timeline'] ?? [], 'Timeline obtenido exitosamente');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    private function storeFile(array $file): string
    {
        $uploadDir = __DIR__ . '/../../../storage/uploads/';
        
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = uniqid() . '_' . basename($file['name']);
        $filePath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new RuntimeException('Error al mover archivo');
        }

        return 'storage/uploads/' . $fileName;
    }
}
