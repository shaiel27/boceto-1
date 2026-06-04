<?php
/**
 * PHP-PRO: Office Report Data Transfer Object
 * 
 * DTO tipado para reporte de oficinas con manejo inteligente de nombres largos
 * Aplica principios de PHP-PRO: strict typing, readonly properties, value objects
 */

declare(strict_types=1);

namespace App\DTO;

final class OfficeReportDTO
{
    public int $id;
    public string $name;
    public string $displayName;
    public int $resolvedCount;
    public float $avgResolutionTime;

    public function __construct(
        int $id,
        string $name,
        string $displayName,
        int $resolvedCount,
        float $avgResolutionTime
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->displayName = $displayName;
        $this->resolvedCount = $resolvedCount;
        $this->avgResolutionTime = $avgResolutionTime;
    }

    /**
     * Crear DTO desde datos crudos del modelo
     * Aplica abreviación inteligente para nombres largos
     */
    public static function fromArray(array $data): self
    {
        $name = $data['name'] ?? '';
        $resolvedCount = (int)($data['resolved_count'] ?? 0);
        $avgResolutionTime = (float)($data['avg_resolution_time'] ?? 0.0);

        return new self(
            id: (int)($data['id'] ?? 0),
            name: $name,
            displayName: self::abbreviateName($name),
            resolvedCount: $resolvedCount,
            avgResolutionTime: $avgResolutionTime
        );
    }

    /**
     * Abreviar nombre de oficina de forma inteligente
     * - Mantiene primeras 3 palabras completas
     * - Abrevia palabras largas después de las primeras 3
     * - Máximo 40 caracteres para displayName
     */
    private static function abbreviateName(string $name): string
    {
        // Si el nombre ya es corto, retornarlo tal cual
        if (strlen($name) <= 35) {
            return $name;
        }

        // Dividir en palabras
        $words = explode(' ', $name);
        $abbreviated = [];
        $charCount = 0;
        $wordCount = 0;
        $maxWords = 3;

        foreach ($words as $word) {
            // Mantener primeras 3 palabras completas
            if ($wordCount < $maxWords && ($charCount + strlen($word)) <= 35) {
                $abbreviated[] = $word;
                $charCount += strlen($word) + 1; // +1 por el espacio
                $wordCount++;
            } else {
                // Abreviar palabras largas después de las primeras 3
                if (strlen($word) > 4) {
                    // Mantener primeras 3 letras + punto
                    $abbreviated[] = strtoupper(substr($word, 0, 3)) . '.';
                } else {
                    $abbreviated[] = $word;
                }
            }
        }

        $result = implode(' ', $abbreviated);

        // Truncar si aún es muy largo
        if (strlen($result) > 40) {
            return substr($result, 0, 37) . '...';
        }

        return $result;
    }

    /**
     * Convertir a array para respuesta JSON
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'display_name' => $this->displayName,
            'resolved_count' => $this->resolvedCount,
            'avg_resolution_time' => $this->avgResolutionTime
        ];
    }

    /**
     * Crear colección de DTOs desde array de datos
     */
    public static function fromArrayCollection(array $data): array
    {
        return array_map(fn($item) => self::fromArray($item), $data);
    }
}
?>
