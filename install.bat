echo %~dp0%
cd /d %~dp0%

del .\package-lock.json
rd /s /q .\dist
call npm install