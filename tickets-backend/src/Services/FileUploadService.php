<?php

namespace App\Services;

use RuntimeException;

class FileUploadService
{
    private array $allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
    ];

    private int $maxFileSize = 5 * 1024 * 1024; // 5MB

    public function upload(array $file, string $directory = 'uploads'): array
    {
        $this->validateFile($file);

        $uploadDir = $this->ensureDirectory($directory);
        $fileName = $this->generateSafeFileName($file['name']);
        $filePath = $uploadDir . '/' . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new RuntimeException('Error al mover el archivo subido');
        }

        return [
            'original_name' => $file['name'],
            'file_name' => $fileName,
            'file_path' => $directory . '/' . $fileName,
            'file_size' => $file['size'],
            'mime_type' => $file['type'],
            'upload_path' => $filePath,
        ];
    }

    public function delete(string $filePath): bool
    {
        $fullPath = __DIR__ . '/../../storage/' . $filePath;
        
        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }
        
        return false;
    }

    public function getFileUrl(string $filePath): string
    {
        return "/api/files/{$filePath}";
    }

    private function validateFile(array $file): void
    {
        if (!isset($file['error']) || is_array($file['error'])) {
            throw new RuntimeException('Parámetros de archivo inválidos');
        }

        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new RuntimeException('Archivo demasiado grande');
            case UPLOAD_ERR_PARTIAL:
                throw new RuntimeException('Archivo subido parcialmente');
            case UPLOAD_ERR_NO_FILE:
                throw new RuntimeException('No se subió ningún archivo');
            default:
                throw new RuntimeException('Error desconocido al subir archivo');
        }

        if ($file['size'] > $this->maxFileSize) {
            throw new RuntimeException('Archivo excede el tamaño máximo permitido');
        }

        if (!in_array($file['type'], $this->allowedMimeTypes)) {
            throw new RuntimeException('Tipo de archivo no permitido');
        }

        if (!is_uploaded_file($file['tmp_name'])) {
            throw new RuntimeException('Archivo no válido');
        }
    }

    private function ensureDirectory(string $directory): string
    {
        $baseDir = __DIR__ . '/../../storage/' . $directory;
        
        if (!is_dir($baseDir)) {
            if (!mkdir($baseDir, 0755, true)) {
                throw new RuntimeException('No se pudo crear el directorio de uploads');
            }
        }

        if (!is_writable($baseDir)) {
            throw new RuntimeException('Directorio de uploads no escribible');
        }

        return $baseDir;
    }

    private function generateSafeFileName(string $originalName): string
    {
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $baseName = pathinfo($originalName, PATHINFO_FILENAME);
        
        $safeBaseName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName);
        $safeBaseName = trim($safeBaseName, '_');
        
        if (empty($safeBaseName)) {
            $safeBaseName = 'file';
        }

        $timestamp = date('Y-m-d_H-i-s');
        $random = mt_rand(1000, 9999);
        
        return "{$safeBaseName}_{$timestamp}_{$random}.{$extension}";
    }

    public function setMaxFileSize(int $size): void
    {
        $this->maxFileSize = $size;
    }

    public function getMaxFileSize(): int
    {
        return $this->maxFileSize;
    }

    public function setAllowedMimeTypes(array $mimeTypes): void
    {
        $this->allowedMimeTypes = $mimeTypes;
    }

    public function getAllowedMimeTypes(): array
    {
        return $this->allowedMimeTypes;
    }
}
