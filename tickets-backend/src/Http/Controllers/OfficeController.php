<?php

namespace App\Http\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Domain\Organization\OfficeRepositoryInterface;
use RuntimeException;

class OfficeController
{
    private OfficeRepositoryInterface $officeRepository;

    public function __construct(OfficeRepositoryInterface $officeRepository)
    {
        $this->officeRepository = $officeRepository;
    }

    public function index(Request $request): Response
    {
        try {
            $offices = $this->officeRepository->findTree();
            
            $officesArray = array_map(fn($office) => $office->toArray(), $offices);
            
            return Response::success($officesArray, 'Oficinas obtenidas exitosamente');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function show(Request $request): Response
    {
        $officeId = (int)$request->getParam('id');

        try {
            $office = $this->officeRepository->findById($officeId);
            
            if ($office === null) {
                return Response::notFound('Oficina no encontrada');
            }

            return Response::success($office->toArray(), 'Oficina encontrada');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function permissions(Request $request): Response
    {
        $officeId = (int)$request->getParam('id');

        try {
            $permissions = $this->officeRepository->findPermissionsByOfficeId($officeId);
            
            return Response::success($permissions, 'Permisos de oficina obtenidos');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function children(Request $request): Response
    {
        $officeId = (int)$request->getParam('id');

        try {
            $children = $this->officeRepository->findChildren($officeId);
            
            $childrenArray = array_map(fn($office) => $office->toArray(), $children);
            
            return Response::success($childrenArray, 'Oficinas hijas obtenidas');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }
}
