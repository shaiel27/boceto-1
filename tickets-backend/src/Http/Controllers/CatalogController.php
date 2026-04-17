<?php

namespace App\Http\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Domain\Catalog\CatalogRepositoryInterface;
use RuntimeException;

class CatalogController
{
    private CatalogRepositoryInterface $catalogRepository;

    public function __construct(CatalogRepositoryInterface $catalogRepository)
    {
        $this->catalogRepository = $catalogRepository;
    }

    public function services(Request $request): Response
    {
        try {
            $services = $this->catalogRepository->findAllServices();
            $servicesArray = array_map(fn($service) => $service->toArray(), $services);
            
            return Response::success($servicesArray, 'Servicios obtenidos exitosamente');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function problems(Request $request): Response
    {
        $serviceId = (int)$request->query('service_id');

        try {
            if ($serviceId) {
                $problems = $this->catalogRepository->findProblemsByServiceId($serviceId);
            } else {
                $problems = [];
                $services = $this->catalogRepository->findAllServices();
                foreach ($services as $service) {
                    $serviceProblems = $this->catalogRepository->findProblemsByServiceId($service->getId());
                    $problems = array_merge($problems, $serviceProblems);
                }
            }
            
            $problemsArray = array_map(fn($problem) => $problem->toArray(), $problems);
            
            return Response::success($problemsArray, 'Problemas obtenidos exitosamente');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function systems(Request $request): Response
    {
        try {
            $systems = $this->catalogRepository->findAllSystems();
            $systemsArray = array_map(fn($system) => $system->toArray(), $systems);
            
            return Response::success($systemsArray, 'Sistemas obtenidos exitosamente');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }
}
