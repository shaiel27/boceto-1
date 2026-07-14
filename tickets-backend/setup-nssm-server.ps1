param([switch]$Remove)

$nssm = "$PSScriptRoot\nssm-2.24\win64\nssm.exe"
$backend = $PSScriptRoot
$frontend = "C:\xampp\htdocs\tickets-frontend"
$app = "C:\xampp\htdocs\tickets-App"
$php = "C:\xampp\php\php.exe"
$node = "C:\Program Files\nodejs\node.exe"

if ($Remove) {
    Write-Host "Deteniendo y eliminando servicios..." -ForegroundColor Yellow
    & $nssm stop TicketsFrontend 2>$null
    & $nssm stop TicketsApp 2>$null
    & $nssm stop TicketsSSE 2>$null
    & $nssm stop TicketsAPI 2>$null
    Start-Sleep -Seconds 2
    & $nssm remove TicketsFrontend confirm 2>$null
    & $nssm remove TicketsApp confirm 2>$null
    & $nssm remove TicketsSSE confirm 2>$null
    & $nssm remove TicketsAPI confirm 2>$null
    Write-Host "Servicios eliminados" -ForegroundColor Green
    exit 0
}

Write-Host "=== 1/4 - TicketsAPI (puerto 8000) ===" -ForegroundColor Cyan
& $nssm install TicketsAPI $php "-S 0.0.0.0:8000 -t $backend\public"
& $nssm set TicketsAPI AppDirectory $backend
& $nssm set TicketsAPI AppStdout "$backend\logs\api-stdout.log"
& $nssm set TicketsAPI AppStderr "$backend\logs\api-stderr.log"
& $nssm set TicketsAPI AppRestartDelay 5000
& $nssm set TicketsAPI AppNoConsole 1
& $nssm set TicketsAPI Description "Tickets System - Backend API (port 8000)"
Write-Host "  TicketsAPI OK" -ForegroundColor Green

Write-Host "=== 2/4 - TicketsSSE (puerto 8001) ===" -ForegroundColor Cyan
& $nssm install TicketsSSE $php "-S 0.0.0.0:8001 -t $backend\public public/sse-server.php"
& $nssm set TicketsSSE AppDirectory $backend
& $nssm set TicketsSSE AppStdout "$backend\logs\sse-stdout.log"
& $nssm set TicketsSSE AppStderr "$backend\logs\sse-stderr.log"
& $nssm set TicketsSSE AppRestartDelay 5000
& $nssm set TicketsSSE AppNoConsole 1
& $nssm set TicketsSSE Description "Tickets System - SSE Server (port 8001)"
Write-Host "  TicketsSSE OK" -ForegroundColor Green

Write-Host "=== 3/4 - TicketsFrontend (puerto 3000) ===" -ForegroundColor Cyan
$rewired = "$frontend\node_modules\react-app-rewired\bin\index.js"
& $nssm install TicketsFrontend $node "`"$rewired`" start"
& $nssm set TicketsFrontend AppDirectory $frontend
& $nssm set TicketsFrontend AppStdout "$backend\logs\frontend-stdout.log"
& $nssm set TicketsFrontend AppStderr "$backend\logs\frontend-stderr.log"
& $nssm set TicketsFrontend AppRestartDelay 5000
& $nssm set TicketsFrontend AppNoConsole 1
& $nssm set TicketsFrontend Description "Tickets System - Frontend React (port 3000)"
Write-Host "  TicketsFrontend OK" -ForegroundColor Green

Write-Host "=== 4/4 - TicketsApp (Expo, puerto 8081) ===" -ForegroundColor Cyan
$expoCli = "$app\node_modules\expo\bin\cli"
& $nssm install TicketsApp $node "`"$expoCli`" start"
& $nssm set TicketsApp AppDirectory $app
& $nssm set TicketsApp AppStdout "$backend\logs\app-stdout.log"
& $nssm set TicketsApp AppStderr "$backend\logs\app-stderr.log"
& $nssm set TicketsApp AppRestartDelay 5000
& $nssm set TicketsApp AppNoConsole 1
& $nssm set TicketsApp Description "Tickets System - Expo mobile app (port 8081)"
Write-Host "  TicketsApp OK" -ForegroundColor Green

Write-Host "=== Iniciando servicios ===" -foregroundcolor Cyan
& $nssm start TicketsAPI
& $nssm start TicketsSSE
& $nssm start TicketsFrontend
& $nssm start TicketsApp

Write-Host "=== Estado ===" -foregroundcolor Cyan
Start-Sleep -Seconds 3
& $nssm status TicketsAPI
& $nssm status TicketsSSE
& $nssm status TicketsFrontend
& $nssm status TicketsApp

Write-Host "`nServicios instalados e iniciados!" -ForegroundColor Green
Write-Host "Frontend React: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Expo App:       http://localhost:8081" -ForegroundColor Yellow
Write-Host "API:            http://localhost:8000" -ForegroundColor Yellow
Write-Host "SSE:            http://localhost:8001" -ForegroundColor Yellow
Write-Host "`nPara eliminar: .\setup-nssm-server.ps1 -Remove" -ForegroundColor Yellow
