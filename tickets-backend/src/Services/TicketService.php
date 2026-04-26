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
     */
    private function assignTechnicianAutomatically(int $ticketId, int $serviceId): ?array
    {
        try {
            $availableTechnicians = $this->technicianModel->getAvailableTechniciansByService($serviceId);

            if (empty($availableTechnicians)) {
                return null;
            }

            $selectedTechnician = $availableTechnicians[0];
            $assigned = $this->technicianModel->assignToTicket(
                $ticketId,
                $selectedTechnician['ID_Technicians'],
                null,
                true
            );

            if ($assigned) {
                // Update ticket status
                $this->ticketModel->updateStatus($ticketId, 'Técnicos Asignados');
                
                return [
                    'id' => $selectedTechnician['ID_Technicians'],
                    'name' => $selectedTechnician['First_Name'] . ' ' . $selectedTechnician['Last_Name']
                ];
            }

            return null;
        } catch (\Exception $e) {
            error_log("Error assigning technician: " . $e->getMessage());
            // Don't throw - ticket should still be created even if assignment fails
            return null;
        }
    }
}
