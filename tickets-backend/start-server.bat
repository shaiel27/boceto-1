@echo off
REM Usa el PHP de XAMPP (incluye pdo_mysql). Si usas solo "php" y tienes C:\php\php.exe, fallará con "could not find driver".
cd /d "%~dp0"
set "XAMPP_PHP=C:\xampp\php\php.exe"
set "JWT_SECRET=change-this-secret-in-production-min-32-chars!!"
if exist "%XAMPP_PHP%" (
  "%XAMPP_PHP%" -S 0.0.0.0:8000 -t public
) else (
  echo No se encontró %XAMPP_PHP%. Instala XAMPP o edita esta ruta.
  php -S 0.0.0.0:8000 -t public
)
