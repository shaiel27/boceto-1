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

            // Notify the requester
            if ($assignedTechnician !== null) {
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
}
