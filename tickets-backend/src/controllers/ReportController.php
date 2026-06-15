<?php
declare(strict_types=1);

require_once __DIR__ . '/../Services/ReportService.php';
require_once __DIR__ . '/../models/AuditLog.php';
require_once __DIR__ . '/../Services/AuditService.php';

final class ReportController
{
    public function __construct(
        private readonly PDO $db,
        private readonly ?int $currentUserId,
        private readonly ?string $currentUserRole,
    ) {}

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
        try {
            $service = new ReportService($this->db);
            $action = $_GET['action'] ?? '';
            $format = $_GET['format'] ?? 'json';
            $dates = $service->parseDateRange($_GET);

            switch ($action) {
                case 'general':
                    $this->requireAdmin();
                    $summary = $service->getGeneralSummary($dates);
                    $monthly = $service->getGeneralReport($dates);
                    $this->respond([
                        'summary' => $summary->toArray(),
                        'monthly' => array_map(fn(GeneralMonthlyDTO $m): array => $m->toArray(), $monthly),
                    ], $format, 'Reporte General de Tickets', $dates);
                    break;

                case 'response-times':
                    $this->requireAdmin();
                    $data = $service->getResponseTimesReport($dates);
                    $this->respond(
                        array_map(fn(ResponseTimeDTO $d): array => $d->toArray(), $data),
                        $format, 'Tiempos de Respuesta', $dates
                    );
                    break;

                case 'office':
                    $this->requireAdmin();
                    $data = $service->getOfficeReport($dates);
                    $this->respond(
                        array_map(fn(OfficeReportDTO $d): array => $d->toArray(), $data),
                        $format, 'Rendimiento por Oficina', $dates
                    );
                    break;

                case 'priority':
                    $this->requireAdmin();
                    $data = $service->getPriorityReport($dates);
                    $this->respond(
                        array_map(fn(PriorityReportDTO $d): array => $d->toArray(), $data),
                        $format, 'Distribución por Prioridad', $dates
                    );
                    break;

                case 'technician-workload':
                    $this->requireAdmin();
                    $data = $service->getTechnicianWorkload($dates);
                    $this->respond(
                        array_map(fn(TechnicianWorkloadDTO $d): array => $d->toArray(), $data),
                        $format, 'Carga de Trabajo — Técnicos', $dates
                    );
                    break;

                case 'service':
                    $this->requireAdmin();
                    $data = $service->getServiceReport($dates);
                    $this->respond(
                        array_map(fn(ServiceReportDTO $d): array => $d->toArray(), $data),
                        $format, 'Distribución por Servicio', $dates
                    );
                    break;

                case 'weekly':
                    $this->requireAdmin();
                    $week = $_GET['week'] ?? date('Y-\WW');
                    $report = $service->getWeeklyReport($week);
                    $dates = [
                        'start_date' => $report->startDate,
                        'end_date'   => $report->endDate,
                    ];
                    $this->respond($report->toArray(), $format, "Reporte Semanal {$week}", $dates);
                    break;

                default:
                    $this->listReports();
            }
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno al generar el reporte',
                'error' => $e->getMessage(),
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    // ─── RESPONSE HELPERS ─────────────────────────────────────────

    private function respond(array $data, string $format, string $title, array $dates): void
    {
        if ($format === 'html') {
            $this->renderHtml($data, $title, $dates);
        } else {
            echo json_encode(
                ['success' => true, 'title' => $title, 'dates' => $dates, 'data' => $data],
                JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
            );
        }
    }

    private function listReports(): void
    {
        $reports = [
            ['action' => 'general',            'label' => 'Reporte General de Tickets',     'desc' => 'Resumen mensual con totales, pendientes, en proceso, resueltos y tiempos promedio.'],
            ['action' => 'response-times',     'label' => 'Tiempos de Respuesta',           'desc' => 'Tiempos promedio, mínimo y máximo de resolución por tipo de servicio.'],
            ['action' => 'office',             'label' => 'Rendimiento por Oficina',        'desc' => 'Tickets creados, resueltos y tiempos promedio por oficina.'],
            ['action' => 'priority',           'label' => 'Distribución por Prioridad',     'desc' => 'Cantidad de tickets por nivel de prioridad con tasas de resolución.'],
            ['action' => 'technician-workload','label' => 'Carga de Trabajo — Técnicos',    'desc' => 'Tickets asignados, resueltos y pendientes por técnico.'],
            ['action' => 'service',            'label' => 'Distribución por Servicio',      'desc' => 'Tickets agrupados por tipo de servicio TI con tasas de resolución.'],
            ['action' => 'weekly',             'label' => 'Reporte Semanal',                'desc' => 'Actividad diaria de la semana (requiere ?week=YYYY-Www).'],
        ];
        echo json_encode(['success' => true, 'reports' => $reports], JSON_UNESCAPED_UNICODE);
    }

    // ─── HTML RENDERER ────────────────────────────────────────────

    private function renderHtml(array $data, string $title, array $dates): void
    {
        $range = ($dates['start_date'] ?? '') . ' — ' . ($dates['end_date'] ?? '');
        $generatedAt = date('d/m/Y H:i');

        header('Content-Type: text/html; charset=UTF-8');
        echo '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">';
        echo '<title>' . htmlspecialchars($title) . '</title>';
        echo '<style>' . $this->printStyles() . '</style></head><body>';

        // ── Page header (repeats on every page) ──
        echo '<div class="page-header">';
        echo '<div class="header-inner">';
        echo '<div class="header-brand">ALCALDÍA DE SAN CRISTÓBAL</div>';
        echo '<div class="header-title">' . htmlspecialchars($title) . '</div>';
        echo '</div>';
        echo '<div class="header-line"></div>';
        echo '</div>';

        // ── Page footer ──
        echo '<div class="page-footer">';
        echo '<div class="footer-line"></div>';
        echo '<div class="footer-inner">';
        echo '<span>Período: ' . htmlspecialchars($range) . '</span>';
        echo '<span>Generado: ' . $generatedAt . '</span>';
        echo '<span>Página <span class="page"></span></span>';
        echo '</div>';
        echo '</div>';

        // ── Content ──
        echo '<div class="content">';
        $this->renderContent($data, $title);
        echo '</div></body></html>';
    }

    private function renderContent(array $data, string $title): void
    {
        // Summary block (general report)
        if (isset($data['summary'])) {
            $s = $data['summary'];
            echo '<div class="summary-grid">';
            $this->summaryCard('Total Tickets', (string)($s['total'] ?? 0), '#1a365d');
            $this->summaryCard('Resueltos', (string)($s['resolved'] ?? 0), '#16a34a');
            $this->summaryCard('En Proceso', (string)($s['in_progress'] ?? 0), '#2563eb');
            $this->summaryCard('Pendientes', (string)($s['pending'] ?? 0), '#d97706');
            $this->summaryCard('Tasa Resolución', ($s['resolution_rate'] ?? 0) . '%', '#7c3aed');
            $this->summaryCard('Prom. Horas', ($s['avg_hours'] ?? 'N/A') . 'h', '#0891b2');
            echo '</div>';

            if (!empty($data['monthly'])) {
                echo '<h2>Desglose Mensual</h2>';
                $this->renderTable($data['monthly'], [
                    'month' => 'Mes', 'total' => 'Total', 'pending' => 'Pend.',
                    'in_progress' => 'En Proc.', 'resolved' => 'Res.',
                    'alta_count' => 'Alta', 'avg_hours' => 'Prom.(h)',
                ]);
            }
            return;
        }

        // Weekly report
        if (isset($data['daily'])) {
            echo '<h2>Actividad Diaria</h2>';
            $this->renderTable($data['daily'], [
                'day_name' => 'Día', 'date' => 'Fecha',
                'total' => 'Total', 'resolved' => 'Resueltos',
            ]);
            if (!empty($data['technicians'])) {
                echo '<h2>Por Técnico</h2>';
                $this->renderTable($data['technicians'], [
                    'technician' => 'Técnico', 'assigned' => 'Asignados', 'resolved' => 'Resueltos',
                ]);
            }
            return;
        }

        // Response times — enhanced table
        if (!empty($data) && isset($data[0]['avg_resolution_min'])) {
            echo '<h2>Tiempos de Resolución por Servicio</h2>';
            $this->renderTable($data, [
                'service' => 'Servicio', 'total' => 'Total',
                'avg_resolution_min' => 'Prom.(min)', 'min_resolution_min' => 'Mín.(min)',
                'max_resolution_min' => 'Máx.(min)',
                'resolved_within_4h' => '< 4h', 'resolved_within_24h' => '< 24h',
            ]);
            return;
        }

        // Priority — enhanced table
        if (!empty($data) && isset($data[0]['priority'])) {
            echo '<h2>Distribución por Prioridad</h2>';
            $this->renderTable($data, [
                'priority' => 'Prioridad', 'total' => 'Total',
                'resolved' => 'Resueltos', 'in_progress' => 'En Proc.',
                'pending' => 'Pend.', 'avg_hours' => 'Prom.(h)',
                'resolution_rate' => 'Tasa %',
            ]);
            return;
        }

        // Generic table for remaining reports
        if (!empty($data) && isset($data[0])) {
            $cols = [];
            foreach ($data[0] as $key => $val) {
                $cols[$key] = ucfirst(str_replace('_', ' ', (string)$key));
            }
            $this->renderTable($data, $cols);
        }
    }

    private function summaryCard(string $label, string $value, string $color): void
    {
        echo '<div class="summary-card" style="--accent:' . $color . '">';
        echo '<div class="sc-value">' . htmlspecialchars($value) . '</div>';
        echo '<div class="sc-label">' . htmlspecialchars($label) . '</div>';
        echo '</div>';
    }

    private function renderTable(array $rows, array $columns): void
    {
        if (empty($rows)) {
            echo '<p class="no-data">Sin datos para el período seleccionado.</p>';
            return;
        }
        echo '<table class="data-table"><thead><tr>';
        foreach ($columns as $key => $label) {
            echo '<th data-field="' . htmlspecialchars((string)$key) . '">' . htmlspecialchars((string)$label) . '</th>';
        }
        echo '</tr></thead><tbody>';
        foreach ($rows as $row) {
            echo '<tr>';
            foreach ($columns as $key => $label) {
                $val = $row[$key] ?? '';
                if (is_numeric($val) && str_contains((string)$key, 'hours')) {
                    $val = round((float)$val, 1) . 'h';
                }
                if (is_numeric($val) && str_contains((string)$key, 'rate')) {
                    $val = round((float)$val, 1) . '%';
                }
                if (is_numeric($val) && (str_contains((string)$key, 'resolution_min') || str_contains((string)$key, 'min'))) {
                    $val = number_format((int)$val);
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
    margin: 28mm 20mm 25mm 20mm;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    font-size: 9.5pt;
    color: #1e293b;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

/* ── Fixed header ── */
.page-header {
    position: fixed;
    top: 0; left: 20mm; right: 20mm;
    height: 24mm;
    background: #fff;
    z-index: 1000;
}
.header-inner {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 6px;
}
.header-brand {
    font-size: 8pt;
    font-weight: 700;
    color: #1a365d;
    text-transform: uppercase;
    letter-spacing: 1.5px;
}
.header-title {
    font-size: 14pt;
    font-weight: 700;
    color: #0f172a;
    text-align: right;
}
.header-line {
    height: 2.5px;
    background: linear-gradient(90deg, #1a365d, #3b82f6);
    margin-top: 0;
}

/* ── Fixed footer ── */
.page-footer {
    position: fixed;
    bottom: 0; left: 20mm; right: 20mm;
    height: 18mm;
    background: #fff;
    z-index: 1000;
}
.footer-line { height: 1px; background: #cbd5e1; margin-bottom: 4px; }
.footer-inner {
    display: flex;
    justify-content: space-between;
    font-size: 7.5pt;
    color: #64748b;
}

/* ── Content ── */
.content { margin-top: 26mm; }

h2 {
    font-size: 12pt;
    font-weight: 700;
    color: #1a365d;
    margin: 18px 0 10px;
    padding-bottom: 5px;
    border-bottom: 2px solid #e2e8f0;
    page-break-after: avoid;
}
h2:first-child { margin-top: 0; }

.no-data {
    color: #94a3b8;
    font-style: italic;
    padding: 20px 0;
    text-align: center;
}

/* ── Summary cards ── */
.summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 16px;
    page-break-inside: avoid;
}
.summary-card {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 14px;
    border-left: 4px solid var(--accent);
    background: #f8fafc;
}
.sc-value {
    font-size: 18pt;
    font-weight: 700;
    color: var(--accent);
    line-height: 1.2;
}
.sc-label {
    font-size: 7.5pt;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
}

/* ── Tables ── */
.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    page-break-inside: auto;
    margin-bottom: 10px;
}
.data-table thead { display: table-header-group; }
.data-table tr { page-break-inside: avoid; }
.data-table th {
    background: #1a365d;
    color: #fff;
    font-weight: 600;
    text-align: left;
    padding: 7px 8px;
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    white-space: nowrap;
}
.data-table th[data-field="priority"] { text-align: center; }
.data-table td {
    padding: 6px 8px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
}
.data-table tbody tr:nth-child(even) td { background: #f8fafc; }
.data-table tbody tr:hover td { background: #f1f5f9; }
.data-table td:not(:first-child) { text-align: center; }
CSS;
    }
}
