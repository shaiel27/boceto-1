# Backend en puerto 8000 con PHP que tenga pdo_mysql (XAMPP en Windows).
Set-Location $PSScriptRoot
$xampp = 'C:\xampp\php\php.exe'
$phpExe = if (Test-Path $xampp) { $xampp } else { 'php' }
if (-not (Test-Path $xampp) -and $phpExe -eq 'php') {
    Write-Warning "No existe C:\xampp\php\php.exe. Si aparece 'could not find driver', instala XAMPP o ajusta la ruta en este script."
}
$env:JWT_SECRET = 'change-this-secret-in-production-min-32-chars!!'
& $phpExe -S 0.0.0.0:8000 -t public
