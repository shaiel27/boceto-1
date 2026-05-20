<?php
declare(strict_types=1);

namespace App\DTO;

/**
 * Dashboard Statistics Data Transfer Object
 * 
 * Immutable value object for dashboard statistics
 * following PHP-PRO principles with strict typing
 */
final class DashboardStatsDTO
{
    public int $totalTickets;
    public float $resolutionRate;

    public function __construct(
        public int $pendingCount,
        public int $inProgressCount,
        public int $resolvedCount,
        public int $criticalCount,
        public int $todayCount,
        public int $weekCount,
        public ?float $avgResolutionHours,
        public int $activeOffices,
        public int $activeTechnicians,
        int $totalTickets,
        float $resolutionRate
    ) {
        $this->totalTickets = $totalTickets;
        $this->resolutionRate = $resolutionRate;
    }

    /**
     * Create from database row
     */
    public static function fromDatabaseRow(array $row): self
    {
        return new self(
            pendingCount: (int) ($row['pending_count'] ?? 0),
            inProgressCount: (int) ($row['in_progress_count'] ?? 0),
            resolvedCount: (int) ($row['resolved_count'] ?? 0),
            criticalCount: (int) ($row['critical_count'] ?? 0),
            todayCount: (int) ($row['today_count'] ?? 0),
            weekCount: (int) ($row['week_count'] ?? 0),
            avgResolutionHours: isset($row['avg_resolution_hours']) 
                ? round((float) $row['avg_resolution_hours'], 2) 
                : null,
            activeOffices: (int) ($row['active_offices'] ?? 0),
            activeTechnicians: (int) ($row['active_technicians'] ?? 0),
            totalTickets: (int) ($row['total_tickets'] ?? 0),
            resolutionRate: (float) ($row['resolution_rate'] ?? 0.0)
        );
    }

    /**
     * Convert to array for JSON response
     */
    public function toArray(): array
    {
        return [
            'pending_count' => $this->pendingCount,
            'in_progress_count' => $this->inProgressCount,
            'resolved_count' => $this->resolvedCount,
            'critical_count' => $this->criticalCount,
            'today_count' => $this->todayCount,
            'week_count' => $this->weekCount,
            'avg_resolution_hours' => $this->avgResolutionHours,
            'active_offices' => $this->activeOffices,
            'active_technicians' => $this->activeTechnicians,
            'total_tickets' => $this->totalTickets,
            'resolution_rate' => $this->resolutionRate
        ];
    }

    /**
     * Get formatted statistics for display
     */
    public function getFormatted(): array
    {
        return [
            'pending' => [
                'count' => $this->pendingCount,
                'percentage' => $this->totalTickets > 0 
                    ? round(($this->pendingCount / $this->totalTickets) * 100, 1) 
                    : 0,
                'color' => '#F59E0B',
                'icon' => 'clock'
            ],
            'in_progress' => [
                'count' => $this->inProgressCount,
                'percentage' => $this->totalTickets > 0 
                    ? round(($this->inProgressCount / $this->totalTickets) * 100, 1) 
                    : 0,
                'color' => '#3B82F6',
                'icon' => 'settings'
            ],
            'resolved' => [
                'count' => $this->resolvedCount,
                'percentage' => $this->resolutionRate,
                'color' => '#10B981',
                'icon' => 'check-circle'
            ],
            'critical' => [
                'count' => $this->criticalCount,
                'percentage' => $this->totalTickets > 0 
                    ? round(($this->criticalCount / $this->totalTickets) * 100, 1) 
                    : 0,
                'color' => '#EF4444',
                'icon' => 'alert-circle'
            ],
            'performance' => [
                'avg_resolution_hours' => $this->avgResolutionHours,
                'avg_resolution_display' => $this->avgResolutionHours 
                    ? round($this->avgResolutionHours, 1) . ' horas'
                    : 'N/A',
                'resolution_rate' => $this->resolutionRate,
                'resolution_rate_display' => $this->resolutionRate . '%'
            ]
        ];
    }
}
