<?php
declare(strict_types=1);

require_once __DIR__ . '/../Services/ReportService.php';
require_once __DIR__ . '/../models/AuditLog.php';
require_once __DIR__ . '/../Services/AuditService.php';

final class ReportController
{
    private ReportService $service;
    private PDO $db;
    private ?int $currentUserId;
    private ?string $currentUserRole;

    public function __construct(PDO $db, ?int $userId, ?string $role)
    {
        $this->db = $db;
        $this->service = new ReportService($db);
        $this->currentUserId = $userId;
        $this->currentUserRole = $role;
    }

    private function requireAuth(): void
    {
        if (!$this->currentUserId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit;
        }
    }

    private function requireAdmin(): void
    {
        $this->requireAuth();
        if ($this->currentUserRole !== 'Admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Solo administradores']);
            exit;
        }
    }

    // ─── MAIN DISPATCH ────────────────────────────────────────────

    public function handleRequest(): void
    {
        $action = $_GET['action'] ?? '';
        $format = $_GET['format'] ?? 'json'; // json | html
        $dates = $this->service->parseDateRange($_GET);

        switch ($action) {
            case 'general':
                $this->requireAdmin();
                $data = [
                    'summary' => $this->service->getGeneralSummary($dates),
                    'monthly' => $this->service->getGeneralReport($dates),
                ];
                $this->respond($data, $format, 'Reporte General de Tickets', $dates);
                break;

            case 'response-times':
                $this->requireAdmin();
                $data = $this->service->getResponseTimesReport($dates);
                $this->respond($data, $format, 'Tiempos de Respuesta', $dates);
                break;

            case 'office':
                $this->requireAdmin();
                $data = $this->service->getOfficeReport($dates);
                $this->respond($data, $format, 'Rendimiento por Oficina', $dates);
                break;

            case 'priority':
                $this->requireAdmin();
                $data = $this->service->getPriorityReport($dates);
                $this->respond($data, $format, 'Distribución por Prioridad', $dates);
                break;

            case 'technician-workload':
                $this->requireAdmin();
                $data = $this->service->getTechnicianWorkload($dates);
                $this->respond($data, $format, 'Carga de Trabajo — Técnicos', $dates);
                break;

            case 'service':
                $this->requireAdmin();
                $data = $this->service->getServiceReport($dates);
                $this->respond($data, $format, 'Distribución por Servicio', $dates);
                break;

            case 'weekly':
                $this->requireAdmin();
                $week = $_GET['week'] ?? date('Y-\WW');
                $data = $this->service->getWeeklyReport($week);
                $dates = [
                    'start_date' => $data['start_date'] ?? '',
                    'end_date'   => $data['end_date'] ?? '',
                ];
                $this->respond($data, $format, "Reporte Semanal {$week}", $dates);
                break;

            default:
                $this->listReports($format, $dates);
        }
    }

    // ─── RESPONSE HELPERS ─────────────────────────────────────────

    private function respond(array $data, string $format, string $title, array $dates): void
    {
        if ($format === 'html') {
            $this->renderHtml($data, $title, $dates);
        } else {
            echo json_encode(['success' => true, 'title' => $title, 'dates' => $dates, 'data' => $data], JSON_UNESCAPED_UNICODE);
        }
    }

    private function listReports(string $format, array $dates): void
    {
        $reports = [
            ['action' => 'general',           'label' => 'Reporte General de Tickets',    'desc' => 'Resumen mensual con totales, pendientes, en proceso, resueltos y tiempos promedio.'],
            ['action' => 'response-times',    'label' => 'Tiempos de Respuesta',          'desc' => 'Tiempos promedio, mínimo y máximo de resolución por tipo de servicio.'],
            ['action' => 'office',            'label' => 'Rendimiento por Oficina',        'desc' => 'Tickets creados, resueltos y tiempos promedio por oficina.'],
            ['action' => 'priority',          'label' => 'Distribución por Prioridad',     'desc' => 'Cantidad de tickets por nivel de prioridad con tasas de resolución.'],
            ['action' => 'technician-workload','label' => 'Carga de Trabajo — Técnicos',   'desc' => 'Tickets asignados, resueltos y pendientes por técnico.'],
            ['action' => 'service',           'label' => 'Distribución por Servicio',      'desc' => 'Tickets agrupados por tipo de servicio TI con tasas de resolución.'],
            ['action' => 'weekly',            'label' => 'Reporte Semanal',                'desc' => 'Actividad diaria de la semana (requiere ?week=YYYY-Www).'],
        ];

        echo json_encode(['success' => true, 'reports' => $reports], JSON_UNESCAPED_UNICODE);
    }

    // ─── HTML RENDERER ────────────────────────────────────────────

    private function renderHtml(array $data, string $title, array $dates): void
    {
        $range = ($dates['start_date'] ?? '') . ' — ' . ($dates['end_date'] ?? '');
        $generatedAt = date('d/m/Y H:i');
        $totalPages = '<span id="totalPages">?</span>';

        header('Content-Type: text/html; charset=UTF-8');
        echo '<!DOCTYPE html>';
        echo '<html lang="es">';
        echo '<head><meta charset="UTF-8"><title>' . htmlspecialchars($title) . '</title>';
        echo '<style>';
        echo $this->printStyles();
        echo '</style>';
        echo '</head><body>';

        // Fixed header (repeats on every page via CSS position: fixed)
        echo '<div class="page-header">';
        echo '<table class="header-table"><tr>';
        echo '<td class="header-logo">ALCALDÍA DE SAN CRISTÓBAL</td>';
        echo '<td class="header-title">' . htmlspecialchars($title) . '</td>';
        echo '</tr></table>';
        echo '<div class="header-line"></div>';
        echo '</div>';

        // Fixed footer (repeats on every page via CSS position: fixed)
        echo '<div class="page-footer">';
        echo '<div class="footer-line"></div>';
        echo '<table class="footer-table"><tr>';
        echo '<td>Período: ' . htmlspecialchars($range) . '</td>';
        echo '<td style="text-align:center;">Generado: ' . $generatedAt . '</td>';
        echo '<td style="text-align:right;">Página <span class="page"></span></td>';
        echo '</tr></table>';
        echo '</div>';

        // ── CONTENT ──
        echo '<div class="content">';

        // Summary table (for general report)
        if (isset($data['summary'])) {
            $s = $data['summary'];
            echo '<h2>Resumen</h2>';
            echo '<table class="summary-table">';
            echo '<tr><td>Total tickets</td><td><strong>' . ($s['total'] ?? 0) . '</strong></td>';
            echo '<td>Pendientes</td><td><strong>' . ($s['pending'] ?? 0) . '</strong></td>';
            echo '<td>En Proceso</td><td><strong>' . ($s['in_progress'] ?? 0) . '</strong></td></tr>';
            echo '<tr><td>Resueltos</td><td><strong>' . ($s['resolved'] ?? 0) . '</strong></td>';
            echo '<td>Alta prioridad</td><td><strong>' . ($s['alta_count'] ?? 0) . '</strong></td>';
            echo '<td>Tasa resolución</td><td><strong>' . ($s['resolution_rate'] ?? 0) . '%</strong></td></tr>';
            echo '<tr><td>Tiempo promedio</td><td><strong>' . ($s['avg_hours'] ?? 'N/A') . 'h</strong></td>';
            echo '<td></td><td></td><td></td><td></td></tr>';
            echo '</table>';

            // Monthly table
            if (!empty($data['monthly'])) {
                echo '<h2 style="margin-top:24px;">Desglose Mensual</h2>';
                $this->renderDataTable($data['monthly'], [
                    'month' => 'Mes',
                    'total' => 'Total',
                    'pending' => 'Pend.',
                    'in_progress' => 'En Proc.',
                    'resolved' => 'Res.',
                    'alta_count' => 'Alta Prio.',
                    'avg_hours' => 'Prom. (h)',
                ]);
            }
        }
        // Weekly report
        elseif (isset($data['daily'])) {
            echo '<h2>Actividad Diaria</h2>';
            $this->renderDataTable($data['daily'], [
                'day_name' => 'Día',
                'date' => 'Fecha',
                'total' => 'Total',
                'resolved' => 'Resueltos',
            ]);

            if (!empty($data['technicians'])) {
                echo '<h2 style="margin-top:24px;">Por Técnico</h2>';
                $this->renderDataTable($data['technicians'], [
                    'technician' => 'Técnico',
                    'assigned' => 'Asignados',
                    'resolved' => 'Resueltos',
                ]);
            }
        }
        // Flat data tables
        elseif (isset($data[0])) {
            // Auto-detect columns from first row
            $cols = [];
            foreach ($data[0] as $key => $val) {
                $cols[$key] = ucfirst(str_replace('_', ' ', (string)$key));
            }
            $this->renderDataTable($data, $cols);
        }

        echo '</div>';
        echo '</body></html>';
    }

    private function renderDataTable(array $rows, array $columns): void
    {
        if (empty($rows)) {
            echo '<p style="color:#888;font-style:italic;">Sin datos para el período seleccionado.</p>';
            return;
        }
        echo '<table class="data-table">';
        echo '<thead><tr>';
        foreach ($columns as $col => $label) {
            echo '<th>' . htmlspecialchars((string)$label) . '</th>';
        }
        echo '</tr></thead><tbody>';
        foreach ($rows as $row) {
            echo '<tr>';
            foreach ($columns as $col => $label) {
                $val = $row[$col] ?? '';
                if (is_numeric($val) && str_contains((string)$col, 'hours')) {
                    $val = round((float)$val, 1) . 'h';
                }
                echo '<td>' . htmlspecialchars((string)$val) . '</td>';
            }
            echo '</tr>';
        }
        echo '</tbody></table>';
    }

    private function printStyles(): string
    {
        return <<<'CSS'
@page {
    size: A4 portrait;
    margin: 25mm 20mm 28mm 20mm;
    @top-center { content: element(pageHeader); }
    @bottom-center { content: element(pageFooter); }
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    font-size: 10pt;
    color: #1e293b;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

/* ── Fixed header (repeated on all pages) ── */
.page-header {
    position: fixed;
    top: 0;
    left: 20mm;
    right: 20mm;
    height: 22mm;
    background: #fff;
    z-index: 1000;
}
.header-table { width: 100%; border-collapse: collapse; }
.header-table td { vertical-align: bottom; padding-bottom: 6px; }
.header-logo { font-size: 9pt; font-weight: 700; color: #1a365d; text-transform: uppercase; letter-spacing: 1px; }
.header-title { text-align: right; font-size: 14pt; font-weight: 700; color: #1e293b; }
.header-line { height: 2px; background: #1a365d; margin-top: 0; }

/* ── Fixed footer (repeated on all pages) ── */
.page-footer {
    position: fixed;
    bottom: 0;
    left: 20mm;
    right: 20mm;
    height: 20mm;
    background: #fff;
    z-index: 1000;
}
.footer-line { height: 1px; background: #cbd5e1; margin-bottom: 6px; }
.footer-table { width: 100%; border-collapse: collapse; font-size: 8pt; color: #64748b; }
.footer-table td { vertical-align: top; }

/* ── Content ── */
.content {
    margin-top: 22mm;
    page-break-after: auto;
}
h2 {
    font-size: 12pt;
    font-weight: 700;
    color: #1a365d;
    margin-bottom: 10px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 6px;
    page-break-after: avoid;
}

/* ── Tables ── */
.summary-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
}
.summary-table td {
    padding: 6px 10px;
    font-size: 10pt;
    border-bottom: 1px solid #f1f5f9;
}
.summary-table td strong { color: #1a365d; }

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    page-break-inside: auto;
}
.data-table thead {
    display: table-header-group;
}
.data-table tr {
    page-break-inside: avoid;
    page-break-after: auto;
}
.data-table th {
    background: #1a365d;
    color: #fff;
    font-weight: 600;
    text-align: left;
    padding: 8px 10px;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.data-table td {
    padding: 7px 10px;
    border-bottom: 1px solid #f1f5f9;
}
.data-table tr:nth-child(even) td {
    background: #f8fafc;
}
CSS;
    }
}
