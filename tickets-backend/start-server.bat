@echo off
echo Iniciando servidor backend simplificado...
cd /d "%~dp0"
C:\xampp\php\php.exe -S localhost:8000 public\index-simple.php
pause
