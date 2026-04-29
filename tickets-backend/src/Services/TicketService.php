<?php

declare(strict_types=1);

final class TicketService
{
    private PDO $db;
    private ServiceRequest $ticketModel;
    private Technician $technicianModel;

    public function __construct(PDO $db, ServiceRequest $ticketModel, Technician $technicianModel)
    {
        $this->db = $db;
        $this->ticketModel = $ticketModel;
        $this->technicianModel = $technicianModel;
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

            // Select technician with lowest workload (already ordered by Active_Tickets_Count ASC)
            $selectedTechnician = $availableTechnicians[0];

            error_log("Auto-assigning technician: {$selectedTechnician['First_Name']} {$selectedTechnician['Last_Name']} " .
                      "(Active Tickets: {$selectedTechnician['Active_Tickets_Count']}, Priority: {$selectedTechnician['priority_score']})");

            $assigned = $this->technicianModel->assignToTicket(
                $ticketId,
                $selectedTechnician['ID_Technicians'],
                null,
                true
            );

            if ($assigned) {
                // Update ticket status to 'En Proceso'
                $this->ticketModel->updateStatus($ticketId, 'En Proceso');

                error_log("Successfully auto-assigned technician {$selectedTechnician['ID_Technicians']} to ticket {$ticketId}");

                return [
                    'id' => $selectedTechnician['ID_Technicians'],
                    'name' => $selectedTechnician['First_Name'] . ' ' . $selectedTechnician['Last_Name']
                ];
            } else {
                error_log("Failed to assign technician {$selectedTechnician['ID_Technicians']} to ticket {$ticketId}");
            }

            return null;
        } catch (\Exception $e) {
            error_log("Error assigning technician: " . $e->getMessage());
            // Don't throw - ticket should still be created even if assignment fails
            return null;
        }
    }
}
