<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Office.php';

final class StructureController
{
    private PDO $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function handleRequest(): void
    {
        $action = $_GET['action'] ?? '';

        switch ($action) {
            case 'full':
                $this->getFullStructure();
                break;
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Acción no válida']);
                break;
        }
    }

    private function getFullStructure(): void
    {
        try {
            $query = "SELECT 
                        o.ID_Office,
                        o.Name_Office,
                        o.coduniadm,
                        o.created_at,
                        b.ID_Boss,
                        b.Name_Boss as boss_name,
                        b.pronoun as boss_pronoun,
                        u.ID_Users as boss_user_id,
                        u.Email as boss_email,
                        u.Full_Name as boss_full_name
                      FROM Office o
                      LEFT JOIN Boss b ON o.Fk_Boss_ID = b.ID_Boss
                      LEFT JOIN Users u ON b.Fk_User = u.ID_Users
                      ORDER BY o.Name_Office ASC";

            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $offices = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get technician counts per office
            $techQuery = "SELECT 
                            sr.Fk_Office,
                            COUNT(DISTINCT tt.Fk_Technician) as technician_count
                          FROM Service_Request sr
                          LEFT JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request
                          GROUP BY sr.Fk_Office";

            $techStmt = $this->db->prepare($techQuery);
            $techStmt->execute();
            $techCounts = $techStmt->fetchAll(PDO::FETCH_ASSOC);
            $techCountMap = [];
            foreach ($techCounts as $tc) {
                $techCountMap[(int)$tc['Fk_Office']] = (int)$tc['technician_count'];
            }

            // Enrich offices with technician count
            foreach ($offices as &$office) {
                $oid = (int)$office['ID_Office'];
                $office['technician_count'] = $techCountMap[$oid] ?? 0;
                $office['has_boss'] = $office['boss_user_id'] !== null;
            }
            unset($office);

            echo json_encode([
                'success' => true,
                'data' => $offices
            ]);

        } catch (PDOException $e) {
            error_log("StructureController Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener la estructura organizativa'
            ]);
        }
    }
}
