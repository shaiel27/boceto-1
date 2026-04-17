<?php

use App\Core\Router;
use App\Core\Request;
use App\Core\Response;
use App\Http\Middleware\CorsMiddleware;
use App\Http\Middleware\RateLimitMiddleware;
use App\Http\Middleware\AuthMiddleware;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TechnicianController;
use App\Http\Controllers\OfficeController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\ReportController;
use App\Application\Auth\AuthenticateUserHandler;
use App\Application\Ticket\CreateTicketHandler;
use App\Application\Ticket\AssignTechnicianHandler;
use App\Application\Ticket\UpdateStatusHandler;
use App\Application\Ticket\ListTicketsQuery;
use App\Application\Technician\FindAvailableTechniciansHandler;
use App\Application\Technician\SyncAvailabilityHandler;
use App\Domain\User\UserRepositoryInterface;
use App\Domain\Ticket\TicketRepositoryInterface;
use App\Domain\Technician\TechnicianRepositoryInterface;
use App\Domain\Organization\OfficeRepositoryInterface;
use App\Domain\Catalog\CatalogRepositoryInterface;
use App\Infrastructure\Persistence\PdoUserRepository;
use App\Infrastructure\Persistence\PdoTicketRepository;
use App\Infrastructure\Persistence\PdoTechnicianRepository;
use App\Infrastructure\Persistence\PdoOfficeRepository;
use App\Infrastructure\Persistence\PdoCatalogRepository;
use App\Infrastructure\Security\JwtManager;
use App\Infrastructure\Security\PasswordHasher;

return function (Router $router) {
    // Dependencies
    $userRepository = new PdoUserRepository();
    $ticketRepository = new PdoTicketRepository();
    $technicianRepository = new PdoTechnicianRepository();
    $officeRepository = new PdoOfficeRepository();
    $catalogRepository = new PdoCatalogRepository();
    
    $passwordHasher = new PasswordHasher();
    $jwtManager = new JwtManager();
    
    // Handlers
    $authHandler = new AuthenticateUserHandler($userRepository, $passwordHasher, $jwtManager);
    $createTicketHandler = new CreateTicketHandler($ticketRepository);
    $assignHandler = new AssignTechnicianHandler($ticketRepository, $technicianRepository);
    $updateHandler = new UpdateStatusHandler($ticketRepository);
    $listHandler = new ListTicketsQuery($ticketRepository);
    $findHandler = new FindAvailableTechniciansHandler($technicianRepository);
    $syncHandler = new SyncAvailabilityHandler($technicianRepository);
    
    // Controllers
    $authController = new AuthController($authHandler, $jwtManager);
    $ticketController = new TicketController($createTicketHandler, $assignHandler, $updateHandler, $listHandler);
    $technicianController = new TechnicianController($findHandler, $syncHandler);
    $officeController = new OfficeController($officeRepository);
    $catalogController = new CatalogController($catalogRepository);
    $reportController = new ReportController();
    
    // Middleware
    $corsMiddleware = new CorsMiddleware();
    $rateLimitMiddleware = new RateLimitMiddleware(60, 60);
    $authMiddleware = new AuthMiddleware($jwtManager);
    $adminMiddleware = new RoleMiddleware([1, 'Admin']);
    $technicianMiddleware = new RoleMiddleware([1, 2, 'Admin', 'Tecnico']);
    $bossMiddleware = new RoleMiddleware([1, 3, 'Admin', 'Jefe']);
    
    // Global middleware
    $router->group([$corsMiddleware, $rateLimitMiddleware], function (Router $router) use (
        $authController, $ticketController, $technicianController, $officeController, 
        $catalogController, $reportController, $authMiddleware, $adminMiddleware, 
        $technicianMiddleware, $bossMiddleware
    ) {
        // Public routes
        $router->post('/api/auth/login', [$authController, 'login']);
        
        // Authenticated routes
        $router->group([$authMiddleware], function (Router $router) use (
            $authController, $ticketController, $technicianController, $officeController, 
            $catalogController, $reportController, $adminMiddleware, $technicianMiddleware, $bossMiddleware
        ) {
            // Auth
            $router->post('/api/auth/logout', [$authController, 'logout']);
            $router->get('/api/auth/me', [$authController, 'me']);
            
            // Tickets (authenticated users)
            $router->get('/api/tickets', [$ticketController, 'index']);
            $router->get('/api/tickets/{id}', [$ticketController, 'show']);
            $router->get('/api/tickets/{id}/timeline', [$ticketController, 'timeline']);
            $router->post('/api/tickets/{id}/comments', [$ticketController, 'addComment']);
            
            // Office
            $router->get('/api/offices', [$officeController, 'index']);
            $router->get('/api/offices/{id}', [$officeController, 'show']);
            $router->get('/api/offices/{id}/children', [$officeController, 'children']);
            
            // Catalog
            $router->get('/api/catalog/services', [$catalogController, 'services']);
            $router->get('/api/catalog/problems', [$catalogController, 'problems']);
            $router->get('/api/catalog/systems', [$catalogController, 'systems']);
            
            // Technicians
            $router->get('/api/technicians/available', [$technicianController, 'available']);
            $router->get('/api/technicians/{id}', [$technicianController, 'show']);
            
            // Boss routes
            $router->group([$bossMiddleware], function (Router $router) use ($ticketController) {
                $router->post('/api/tickets', [$ticketController, 'store']);
            });
            
            // Technician routes
            $router->group([$technicianMiddleware], function (Router $router) use ($ticketController, $technicianController) {
                $router->post('/api/tickets/{id}/attachments', [$ticketController, 'uploadAttachment']);
                $router->put('/api/technicians/{id}/schedule', [$technicianController, 'updateSchedule']);
            });
            
            // Admin routes
            $router->group([$adminMiddleware], function (Router $router) use (
                $ticketController, $technicianController, $officeController, $reportController
            ) {
                // Tickets admin
                $router->post('/api/tickets/{id}/assign', [$ticketController, 'assign']);
                $router->put('/api/tickets/{id}/status', [$ticketController, 'updateStatus']);
                
                // Technicians admin
                $router->get('/api/technicians', [$technicianController, 'index']);
                
                // Office admin
                $router->get('/api/offices/{id}/permissions', [$officeController, 'permissions']);
                
                // Reports
                $router->get('/api/reports/general', [$reportController, 'general']);
                $router->get('/api/reports/by-office', [$reportController, 'byOffice']);
                $router->get('/api/reports/response-times', [$reportController, 'responseTimes']);
                $router->get('/api/reports/priority', [$reportController, 'priority']);
                $router->get('/api/reports/monthly', [$reportController, 'monthly']);
                $router->get('/api/reports/by-service', [$reportController, 'byService']);
            });
        });
    });
};
