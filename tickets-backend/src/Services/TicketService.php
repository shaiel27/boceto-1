<?php

declare(strict_types=1);

final class TicketService
{
    private PDO $db;
    private ServiceRequest $ticketModel;
    private Technician $technicianModel;
    private ?NotificationService $notificationService;

    public function __construct(PDO $db, ServiceRequest $ticketModel, Technician $technicianModel, ?NotificationService $notificationService = null)
    {
        $this->db = $db;
        $this->ticketModel = $ticketModel;
        $this->technicianModel = $technicianModel;
        $this->notificationService = $notificationService;
    }

    /**
     * Create a new ticket and optionally assign a technician
     */
    public function createTicket(CreateTicketDTO $dto, int $requesterId): array
    {
        try {
            $this->db->beginTransaction();

            // Handle "Otro" - create a new problem in the catalog if a custom name is provided
            if ($dto->newProblemName !== null && trim($dto->newProblemName) !== '') {
                $problemsCatalog = new ServiceProblemsCatalog($this->db);
                $newProblemId = $problemsCatalog->create(
                    $dto->fkTiService,
                    trim($dto->newProblemName),
                    'Problema personalizado ingresado por el usuario',
                    'Media'
                );
                if ($newProblemId === false) {
                    throw new \RuntimeException('No se pudo crear el nuevo problema en el catálogo');
                }
                $dto->fkProblemCatalog = $newProblemId;
            }

            // Create the ticket
            $ticketId = $this->ticketModel->createWithDTO($dto, $requesterId);

            if (!$ticketId) {
                throw new \RuntimeException('No se pudo crear el ticket');
            }

            // Try to assign a technician automatically
            $assignedTechnician = $this->assignTechnicianAutomatically($ticketId, $dto->fkTiService);

            // Create notification if notification service is available
            if ($this->notificationService !== null) {
                $this->createNotificationForTicket($requesterId, $ticketId, $assignedTechnician, $dto);
            }

            $this->db->commit();

            return [
                'success' => true,
                'ticket_id' => $ticketId,
                'technician_assigned' => $assignedTechnician !== null,
                'technician_name' => $assignedTechnician['name'] ?? null
            ];
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Database error in createTicket: " . $e->getMessage());
            throw new \RuntimeException('Error de base de datos al crear ticket');
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Error in createTicket: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Automatically assign an available technician to a ticket
     * Uses intelligent selection based on workload and availability
     */
    private function assignTechnicianAutomatically(int $ticketId, int $serviceId): ?array
    {
        try {
            $availableTechnicians = $this->technicianModel->getAvailableTechniciansByService($serviceId);

            if (empty($availableTechnicians)) {
                error_log("No available technicians found for service {$serviceId}");
                return null;
            }

            // Try technicians in order until assignment succeeds
            foreach ($availableTechnicians as $selectedTechnician) {
                error_log("Auto-assigning technician: {$selectedTechnician['First_Name']} {$selectedTechnician['Last_Name']} " .
                          "(Active Tickets: {$selectedTechnician['Active_Tickets_Count']})");

                $assigned = $this->technicianModel->assignToTicket(
                    $ticketId,
                    $selectedTechnician['ID_Technicians'],
                    null,
                    true
                );

                if ($assigned) {
                    error_log("Successfully auto-assigned technician {$selectedTechnician['ID_Technicians']} to ticket {$ticketId}");

                    return [
                        'id' => $selectedTechnician['ID_Technicians'],
                        'name' => $selectedTechnician['First_Name'] . ' ' . $selectedTechnician['Last_Name']
                    ];
                }
                error_log("Failed to assign technician {$selectedTechnician['ID_Technicians']} to ticket {$ticketId}, trying next candidate...");
            }

            return null;
        } catch (\Exception $e) {
            error_log("Error assigning technician: " . $e->getMessage());
            // Don't throw - ticket should still be created even if assignment fails
            return null;
        }
    }

    /**
     * Create notification for ticket creation
     */
    private function createNotificationForTicket(int $requesterId, int $ticketId, ?array $assignedTechnician, CreateTicketDTO $dto): void
    {
        try {
            // Get service and office names from DTO or database
            $serviceName = $this->getServiceName($dto->fkTiService);
            $officeName = $this->getOfficeName($dto->fkOffice);
            $priority = $dto->systemPriority ?? 'Media';
            $technicianName = $assignedTechnician['name'] ?? null;

            // Notify the assigned technician (for auto-assign)
            if ($assignedTechnician !== null) {
                try {
                    $techData = $this->technicianModel->getById($assignedTechnician['id']);
                    if ($techData && isset($techData['Fk_Users'])) {
                        $this->notificationService->createTechnicianAssignedNotification(
                            technicianUserId: (int)$techData['Fk_Users'],
                            ticketId: $ticketId,
                            ticketCode: $dto->ticketCode ?? '',
                            subject: $dto->subject ?? '',
                            officeName: $officeName,
                            serviceName: $serviceName,
                            priority: $priority
                        );
                    }
                } catch (\Exception $e) {
                    error_log("Error notifying auto-assigned technician: " . $e->getMessage());
                }

                $this->notificationService->createTicketAssignmentNotification(
                    requesterId: $requesterId,
                    ticketId: $ticketId,
                    technicianName: $technicianName,
                    serviceName: $serviceName,
                    officeName: $officeName,
                    priority: $priority
                );
            } else {
                $this->notificationService->createTicketCreatedNotification(
                    requesterId: $requesterId,
                    ticketId: $ticketId,
                    serviceName: $serviceName,
                    officeName: $officeName,
                    priority: $priority
                );
            }

            // Notify all admins (role 1) with technician, service, and office data
            $this->notificationService->createAdminTicketNotification(
                ticketId: $ticketId,
                technicianName: $technicianName,
                serviceName: $serviceName,
                officeName: $officeName,
                priority: $priority
            );
        } catch (\Exception $e) {
            error_log("Error creating notification: " . $e->getMessage());
            // Don't throw - ticket should still be created even if notification fails
        }
    }

    /**
     * Get service name by ID
     */
    private function getServiceName(int $serviceId): string
    {
        try {
            $query = "SELECT Type_Service as Service_Name FROM TI_Service WHERE ID_TI_Service = :service_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(":service_id", $serviceId, \PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            return $result['Service_Name'] ?? 'Desconocido';
        } catch (\Exception $e) {
            error_log("Error getting service name: " . $e->getMessage());
            return 'Desconocido';
        }
    }

    /**
     * Get office name by ID
     */
    private function getOfficeName(int $officeId): string
    {
        try {
            $query = "SELECT Name_Office as Office_Name FROM Office WHERE ID_Office = :office_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(":office_id", $officeId, \PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            return $result['Office_Name'] ?? 'Desconocida';
        } catch (\Exception $e) {
            error_log("Error getting office name: " . $e->getMessage());
            return 'Desconocida';
        }
    }

    /**
     * Verify a ticket (requester confirms or rejects the resolution).
     *
     * @param int $ticketId
     * @param string $verification 'conforme' or 'inconforme'
     * @param string|null $comment Required if verification is 'inconforme'
     * @param int $requesterUserId The user ID of the requester performing the verification
     * @return array{success: bool, message: string, status?: string, technician_assigned?: bool, technician_name?: string}
     */
    public function verifyTicket(int $ticketId, string $verification, ?string $comment, int $requesterUserId): array
    {
        require_once __DIR__ . '/../Enums/TicketStatus.php';
        require_once __DIR__ . '/../models/TicketComment.php';
        require_once __DIR__ . '/../models/TicketTimeline.php';

        $ticket = $this->ticketModel->getById($ticketId);
        if (!$ticket) {
            return ['success' => false, 'message' => 'Ticket no encontrado'];
        }

        if ($ticket['Status'] !== \App\Enums\TicketStatus::PENDIENTE_VERIFICACION) {
            return ['success' => false, 'message' => 'El ticket no está pendiente de verificación'];
        }

        if ((int)$ticket['Fk_User_Requester'] !== $requesterUserId) {
            return ['success' => false, 'message' => 'Solo el solicitante puede verificar este ticket'];
        }

        try {
            $this->db->beginTransaction();

            $timeline = new \TicketTimeline($this->db);

            if ($verification === 'conforme') {
                // === CONFORME: close the ticket ===
                $this->ticketModel->updateStatus($ticketId, \App\Enums\TicketStatus::CERRADO);

                $timeline->create(
                    $ticketId,
                    $requesterUserId,
                    'Verificación conforme: ticket cerrado por el solicitante',
                    \App\Enums\TicketStatus::PENDIENTE_VERIFICACION,
                    \App\Enums\TicketStatus::CERRADO
                );

                if ($comment && trim($comment) !== '') {
                    $commentModel = new \TicketComment($this->db);
                    $commentModel->Fk_Service_Request = $ticketId;
                    $commentModel->Fk_User = $requesterUserId;
                    $commentModel->Comment = trim($comment);
                    $commentModel->create();
                }

                $this->db->commit();

                return [
                    'success' => true,
                    'message' => 'Ticket cerrado exitosamente',
                    'status' => \App\Enums\TicketStatus::CERRADO,
                ];
            }

            // === INCONFORME: reopen, unassign, reassign ===
            if ($verification !== 'inconforme') {
                $this->db->rollBack();
                return ['success' => false, 'message' => 'Tipo de verificación no válido'];
            }

            if (!$comment || trim($comment) === '') {
                $this->db->rollBack();
                return ['success' => false, 'message' => 'Se requiere un comentario explicando la inconformidad'];
            }

            // 1. Mark as returned and move back to En Proceso
            $this->ticketModel->markReturned($ticketId);
            $this->ticketModel->updateStatus($ticketId, \App\Enums\TicketStatus::EN_PROCESO);

            // 2. Release all currently assigned technicians
            $releasedCount = $this->ticketModel->releaseAllTechnicians($ticketId);
            error_log("Released {$releasedCount} technicians from ticket {$ticketId}");

            // 3. Re-assign a new technician automatically
            $ticketServiceId = (int)$ticket['Fk_TI_Service'];
            $newTechnician = $this->assignTechnicianAutomatically($ticketId, $ticketServiceId);

            // 4. Save the inconformity comment
            $commentModel = new \TicketComment($this->db);
            $commentModel->Fk_Service_Request = $ticketId;
            $commentModel->Fk_User = $requesterUserId;
            $commentModel->Comment = '[INCONFORMIDAD] ' . trim($comment);
            $commentModel->create();

            // 5. Timeline entry
            $timeline->create(
                $ticketId,
                $requesterUserId,
                'Inconformidad del solicitante: ticket devuelto a En Proceso',
                \App\Enums\TicketStatus::PENDIENTE_VERIFICACION,
                \App\Enums\TicketStatus::EN_PROCESO
            );

            // 6. Notify the new technician
            if ($this->notificationService !== null && $newTechnician !== null) {
                try {
                    $techData = $this->technicianModel->getById($newTechnician['id']);
                    if ($techData && isset($techData['Fk_Users'])) {
                        $this->notificationService->createTechnicianAssignedNotification(
                            technicianUserId: (int)$techData['Fk_Users'],
                            ticketId: $ticketId,
                            ticketCode: $ticket['Ticket_Code'] ?? '',
                            subject: $ticket['Subject'] ?? '',
                            officeName: $this->getOfficeName((int)$ticket['Fk_Office']),
                            serviceName: $this->getServiceName($ticketServiceId),
                            priority: $ticket['System_Priority'] ?? 'Media'
                        );
                    }
                } catch (\Exception $e) {
                    error_log("Error notifying new technician: " . $e->getMessage());
                }
            }

            $this->db->commit();

            $msg = $newTechnician !== null
                ? 'Ticket devuelto a En Proceso y reasignado a ' . $newTechnician['name']
                : 'Ticket devuelto a En Proceso (sin técnicos disponibles para reasignar)';

            return [
                'success' => true,
                'message' => $msg,
                'status' => \App\Enums\TicketStatus::EN_PROCESO,
                'technician_assigned' => $newTechnician !== null,
                'technician_name' => $newTechnician['name'] ?? null,
            ];
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("verifyTicket error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error al procesar la verificación'];
        }
    }
}
