<?php
declare(strict_types=1);

/**
 * PHP-PRO: Problem Report Controller
 * 
 * Controller para reporte de problemas más frecuentes por servicio
 * Aplica principios PHP-PRO: strict typing, proper error handling, CORS headers
 */

require_once __DIR__ . '/../models/ProblemReport.php';
require_once __DIR__ . '/../config/database.php';

class ProblemReportController
{
    private $conn;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    private function requireAuth(): void
    {
        $currentUserId = $_SERVER['AUTH_USER_ID'] ?? null;
        if (!$currentUserId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit;
        }
    }

    public function handleRequest()
    {
        $this->requireAuth();

        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';
        $format = $_GET['format'] ?? 'json';

        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        try {
            $data = [];
            $title = 'Reporte de Problemas';
            $startDate = $_GET['start_date'] ?? null;
            $endDate = $_GET['end_date'] ?? null;

            switch ($action) {
                case 'all':
                    $data = $this->getAllProblemsData($startDate, $endDate);
                    $title = 'Reporte de Problemas por Servicio';
                    break;
                case 'top':
                    $data = $this->getTopProblemData($startDate, $endDate);
                    $title = 'Problema mas Frecuente por Servicio';
                    break;
                case 'monthly':
                    $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-90 days'));
                    $endDate = $_GET['end_date'] ?? date('Y-m-d');
                    $data = $this->getProblemsByMonthData($startDate, $endDate);
                    $title = 'Reporte Mensual por Tipo de Servicio';
                    break;
                case 'systems':
                    $data = $this->getSystemsData($startDate, $endDate);
                    $title = 'Reporte de Sistemas y Problematicas';
                    break;
                default:
                    if ($format === 'html') {
                        $this->renderHtml([], 'Reportes de Problemas', $startDate, $endDate);
                        return;
                    }
                    http_response_code(400);
                    header('Content-Type: application/json');
                    echo json_encode(['success' => false, 'message' => 'Accion no valida. Use: all, top, monthly, systems']);
                    return;
            }

            if ($format === 'html') {
                $this->renderHtml($data, $title, $startDate, $endDate);
                return;
            }

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Reporte obtenido exitosamente',
                'data' => $data,
                'dates' => ['start_date' => $startDate ?? date('Y-m-d', strtotime('-90 days')), 'end_date' => $endDate ?? date('Y-m-d')],
            ]);
        } catch (Exception $e) {
            error_log("Error en ProblemReportController: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
        }
    }

    private function getAllProblemsData($startDate, $endDate): array {
        $problemReport = new ProblemReport($this->conn);
        return $problemReport->getMostFrequentProblemsByService($startDate, $endDate);
    }

    private function getTopProblemData($startDate, $endDate): array {
        $problemReport = new ProblemReport($this->conn);
        return $problemReport->getTopProblemByService($startDate, $endDate);
    }

    private function getProblemsByMonthData($startDate, $endDate): array {
        $problemReport = new ProblemReport($this->conn);
        return $problemReport->getProblemsByMonth($startDate, $endDate);
    }

    private function getSystemsData($startDate, $endDate): array {
        $problemReport = new ProblemReport($this->conn);
        return $problemReport->getSystemsAndProblems($startDate, $endDate);
    }

    // ─── HTML RENDERER ────────────────────────────────────────────

    private function renderHtml(array $data, string $title, ?string $startDate, ?string $endDate): void
    {
        $range = ($startDate ?? '—') . ' — ' . ($endDate ?? date('Y-m-d'));
        $generatedAt = date('d/m/Y H:i');

        header('Content-Type: text/html; charset=UTF-8');
        echo '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">';
        echo '<title>' . htmlspecialchars($title) . '</title>';
        echo '<style>' . $this->printStyles() . '</style></head><body>';

        echo '<div class="page-header">';
        echo '<div class="header-inner">';
        echo '<div class="header-brand">ALCALDIA DE SAN CRISTOBAL</div>';
        echo '<div class="header-title">' . htmlspecialchars($title) . '</div>';
        echo '</div><div class="header-line"></div></div>';

        echo '<div class="page-footer">';
        echo '<div class="footer-line"></div>';
        echo '<div class="footer-inner">';
        echo '<span>Periodo: ' . htmlspecialchars($range) . '</span>';
        echo '<span>Generado: ' . $generatedAt . '</span>';
        echo '<span>Pagina <span class="page"></span></span>';
        echo '</div></div>';

        echo '<div class="content">';
        if (empty($data)) {
            echo '<p class="no-data">Sin datos para el periodo seleccionado.</p>';
        } elseif (isset($data[0]['sistema'])) {
            $this->renderSystemsTable($data);
        } elseif (isset($data[0]['month_key'])) {
            $this->renderMonthlyTable($data);
        } else {
            $this->renderProblemTable($data);
        }
        echo '</div></body></html>';
    }

    private function renderProblemTable(array $rows): void
    {
        echo '<h2>Problemas por Servicio</h2>';
        echo '<table class="data-table"><thead><tr>';
        echo '<th>Servicio</th><th>Total</th><th>Cerrados</th><th>Oficinas</th><th>Tecnicos</th><th>Prob. Frecuente</th><th>%</th>';
        echo '</tr></thead><tbody>';
        foreach ($rows as $r) {
            echo '<tr>';
            echo '<td>' . htmlspecialchars((string)($r['tipo_servicio'] ?? $r['service_name'] ?? 'N/A')) . '</td>';
            echo '<td>' . (int)($r['total_tickets_mes'] ?? $r['ticket_count'] ?? 0) . '</td>';
            echo '<td>' . (int)($r['cerrados_mes'] ?? 0) . '</td>';
            echo '<td>' . (int)($r['oficinas_atendidas_mes'] ?? 0) . '</td>';
            echo '<td>' . (int)($r['tecnicos_involucrados_mes'] ?? 0) . '</td>';
            echo '<td>' . htmlspecialchars((string)($r['problematica_mas_frecuente_mes'] ?? $r['problem_name'] ?? 'N/A')) . '</td>';
            echo '<td>' . number_format((float)($r['porcentaje_mes_actual'] ?? 0), 1) . '%</td>';
            echo '</tr>';
        }
        echo '</tbody></table>';
    }

    private function renderMonthlyTable(array $rows): void
    {
        echo '<h2>Problemas por Mes</h2>';
        echo '<table class="data-table"><thead><tr>';
        echo '<th>Mes</th><th>Problema</th><th>Severidad</th><th>Tickets</th>';
        echo '</tr></thead><tbody>';
        foreach ($rows as $r) {
            echo '<tr>';
            echo '<td>' . htmlspecialchars((string)($r['month_name'] ?? $r['month_key'] ?? 'N/A')) . '</td>';
            echo '<td>' . htmlspecialchars((string)($r['problem_name'] ?? 'N/A')) . '</td>';
            echo '<td>' . htmlspecialchars((string)($r['severity'] ?? 'N/A')) . '</td>';
            echo '<td>' . (int)($r['ticket_count'] ?? 0) . '</td>';
            echo '</tr>';
        }
        echo '</tbody></table>';
    }

    private function renderSystemsTable(array $rows): void
    {
        echo '<h2>Sistemas y Problematicas</h2>';
        echo '<table class="data-table"><thead><tr>';
        echo '<th>Sistema</th><th>Total Tickets</th><th>Problematica Comun</th><th>Frecuencia</th>';
        echo '</tr></thead><tbody>';
        foreach ($rows as $r) {
            echo '<tr>';
            echo '<td>' . htmlspecialchars((string)($r['sistema'] ?? $r['system_name'] ?? 'N/A')) . '</td>';
            echo '<td>' . (int)($r['total_tickets'] ?? 0) . '</td>';
            echo '<td>' . htmlspecialchars((string)($r['problematica_mas_comun'] ?? $r['common_problem'] ?? 'N/A')) . '</td>';
            echo '<td>' . (int)($r['frecuencia_problematica'] ?? $r['frequency'] ?? 0) . '</td>';
            echo '</tr>';
        }
        echo '</tbody></table>';
    }

    private function printStyles(): string
    {
        return <<<'CSS'
@page { size: A4 portrait; margin: 28mm 20mm 25mm 20mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    font-size: 9.5pt; color: #1e293b; line-height: 1.55;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.page-header {
    position: fixed; top: 0; left: 20mm; right: 20mm;
    height: 24mm; background: #fff; z-index: 1000;
}
.header-inner { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 6px; }
.header-brand { font-size: 8pt; font-weight: 700; color: #1a365d; text-transform: uppercase; letter-spacing: 1.5px; }
.header-title { font-size: 14pt; font-weight: 700; color: #0f172a; text-align: right; }
.header-line { height: 2.5px; background: linear-gradient(90deg, #1a365d, #3b82f6); }
.page-footer {
    position: fixed; bottom: 0; left: 20mm; right: 20mm;
    height: 18mm; background: #fff; z-index: 1000;
}
.footer-line { height: 1px; background: #cbd5e1; margin-bottom: 4px; }
.footer-inner { display: flex; justify-content: space-between; font-size: 7.5pt; color: #64748b; }
.content { margin-top: 26mm; }
h2 {
    font-size: 12pt; font-weight: 700; color: #1a365d;
    margin: 18px 0 10px; padding-bottom: 5px;
    border-bottom: 2px solid #e2e8f0; page-break-after: avoid;
}
.no-data { color: #94a3b8; font-style: italic; padding: 20px 0; text-align: center; }
.data-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; page-break-inside: auto; margin-bottom: 10px; }
.data-table thead { display: table-header-group; }
.data-table tr { page-break-inside: avoid; }
.data-table th {
    background: #1a365d; color: #fff; font-weight: 600;
    text-align: left; padding: 7px 8px; font-size: 7.5pt;
    text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap;
}
.data-table td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; }
.data-table tbody tr:nth-child(even) td { background: #f8fafc; }
.data-table td:not(:first-child) { text-align: center; }
CSS;
    }
}
?>
