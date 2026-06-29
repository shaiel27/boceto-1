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

            // Generate ticket code atomically
            require_once __DIR__ . '/TicketCodeGenerator.php';
            $codeGenerator = new TicketCodeGenerator($this->db);
            $nextCode = $codeGenerator->next();

            // Create the ticket
            $ticketId = $this->ticketModel->createWithDTO($dto, $requesterId, $nextCode['code'], $nextCode['generation']);

            if (!$ticketId) {
                throw new \RuntimeException('No se pudo crear el ticket');
            }

            // Try to assign a technician automatically
            $priorityWeight = $this->getPriorityWeight($dto->systemPriority ?? 'Media');
            $assignedTechnician = $this->assignTechnicianAutomatically($ticketId, $dto->fkTiService, $priorityWeight);

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
     *
     * Si el servicio es Soporte y no hay técnicos disponibles,
     * aplica la política institucional de asignación cruzada
     * (técnicos de Redes después de una hora configurable).
     */
    private function assignTechnicianAutomatically(int $ticketId, int $serviceId, int $priorityWeight = 0, array $excludeTechIds = []): ?array
    {
        try {
            // ── 1. Intento primario: técnicos del servicio original ──
            $technicians = $this->technicianModel->getAvailableTechniciansByService(
                $serviceId,
                $priorityWeight,
                $excludeTechIds,
            );

            if (!empty($technicians)) {
                $assigned = $this->tryAssignCandidates($ticketId, $technicians);
                if ($assigned !== null) {
                    return $assigned;
                }
            }

            // ── 2. Fallback: Redes → Soporte (política institucional post-2PM) ──
            require_once __DIR__ . '/../Enums/ServiceType.php';
            require_once __DIR__ . '/../config/CrossServicePolicy.php';

            if (
                $serviceId === \App\Enums\ServiceType::SOPORTE
                && CrossServicePolicy::isActive()
            ) {

                error_log(sprintf(
                    '[CrossService] Sin técnicos de Soporte para ticket %d. '
                    . 'Buscando técnicos de Redes (política activa desde %s).',
                    $ticketId,
                    CrossServicePolicy::CROSS_SERVICE_START_TIME,
                ));

                $redesTechs = $this->technicianModel->getAvailableTechniciansByService(
                    \App\Enums\ServiceType::REDES,
                    $priorityWeight,
                    $excludeTechIds,
                );

                if (!empty($redesTechs)) {
                    $assigned = $this->tryAssignCandidatesCrossService($ticketId, $redesTechs);
                    if ($assigned !== null) {
                        $this->logCrossServiceAssignment($ticketId, $assigned['id']);
                        return $assigned;
                    }
                }

                error_log(sprintf(
                    '[CrossService] No hay técnicos de Redes disponibles para ticket %d.',
                    $ticketId,
                ));
            }

            return null;
        } catch (\Exception $e) {
            error_log("Error assigning technician: " . $e->getMessage());
            // Don't throw - ticket should still be created even if assignment fails
            return null;
        }
    }

    /**
     * Try to assign a ticket to a list of candidates (same-service).
     *
     * @param array<int, array<string, mixed>> $candidates
     * @return array{id: int, name: string}|null
     */
    private function tryAssignCandidates(int $ticketId, array $candidates): ?array
    {
        foreach ($candidates as $tech) {
            error_log(sprintf(
                'Auto-assigning technician: %s %s (Active Tickets: %s)',
                $tech['First_Name'],
                $tech['Last_Name'],
                $tech['Active_Tickets_Count'] ?? '?',
            ));

            $ok = $this->technicianModel->assignToTicket(
                $ticketId,
                $tech['ID_Technicians'],
                null,
                true,   // isLead
                // allowCrossService = false, bypassCapacity = false (por defecto)
            );

            if ($ok) {
                error_log(sprintf(
                    'Successfully auto-assigned technician %d to ticket %d',
                    $tech['ID_Technicians'],
                    $ticketId,
                ));
                return [
                    'id' => $tech['ID_Technicians'],
                    'name' => $tech['First_Name'] . ' ' . $tech['Last_Name'],
                ];
            }

            error_log(sprintf(
                'Failed to assign technician %d to ticket %d, trying next candidate...',
                $tech['ID_Technicians'],
                $ticketId,
            ));
        }

        return null;
    }

    /**
     * Try to assign a ticket to a list of cross-service candidates.
     *
     * A diferencia de tryAssignCandidates(), este método usa
     * allowCrossService=true para saltar la verificación de
     * coincidencia de servicio en assignToTicket().
     *
     * @param array<int, array<string, mixed>> $candidates
     * @return array{id: int, name: string}|null
     */
    private function tryAssignCandidatesCrossService(int $ticketId, array $candidates): ?array
    {
        foreach ($candidates as $tech) {
            error_log(sprintf(
                '[CrossService] Asignando técnico de Redes: %s %s (ticket %d)',
                $tech['First_Name'],
                $tech['Last_Name'],
                $ticketId,
            ));

            $ok = $this->technicianModel->assignToTicket(
                $ticketId,
                $tech['ID_Technicians'],
                null,
                true,   // isLead
                true,   // allowCrossService = true  ← clave: salta el check de servicio
                false,  // bypassCapacity
            );

            if ($ok) {
                error_log(sprintf(
                    '[CrossService] Técnico %s %s asignado exitosamente al ticket %d',
                    $tech['First_Name'],
                    $tech['Last_Name'],
                    $ticketId,
                ));
                return [
                    'id' => $tech['ID_Technicians'],
                    'name' => $tech['First_Name'] . ' ' . $tech['Last_Name'],
                ];
            }

            error_log(sprintf(
                '[CrossService] Falló asignación de técnico %d al ticket %d, siguiente candidato...',
                $tech['ID_Technicians'],
                $ticketId,
            ));
        }

        return null;
    }

    /**
     * Registra en el log una asignación cruzada Redes → Soporte.
     */
    private function logCrossServiceAssignment(int $ticketId, int $techId): void
    {
        error_log(sprintf(
            '[CrossService] Ticket %d asignado a técnico de Redes %d (política post-%s)',
            $ticketId,
            $techId,
            CrossServicePolicy::CROSS_SERVICE_START_TIME,
        ));
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

            // 3. Re-assign a new technician automatically, excluding previous ones
            $ticketServiceId = (int)$ticket['Fk_TI_Service'];
            $previousTechIds = $this->getPreviousTechnicianIds($ticketId);
            $priorityWeight = $this->getPriorityWeight($ticket['System_Priority'] ?? 'Media');
            $newTechnician = $this->assignTechnicianAutomatically($ticketId, $ticketServiceId, $priorityWeight, $previousTechIds);

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

    private function getPriorityWeight(string $priority): int
    {
        $map = ['Crítica' => 10, 'Alta' => 5, 'Media' => 2, 'Baja' => 1];
        foreach ($map as $key => $weight) {
            if (stripos($priority, $key) !== false) {
                return $weight;
            }
        }
        return 2;
    }

    private function getPreviousTechnicianIds(int $ticketId): array
    {
        try {
            $stmt = $this->db->prepare(
                "SELECT DISTINCT Fk_Technician FROM Ticket_Technicians WHERE Fk_Service_Request = ?"
            );
            $stmt->execute([$ticketId]);
            return array_map('intval', $stmt->fetchAll(\PDO::FETCH_COLUMN));
        } catch (\Exception $e) {
            error_log("getPreviousTechnicianIds error: " . $e->getMessage());
            return [];
        }
    }
}
