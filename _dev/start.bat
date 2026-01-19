@echo off
echo Updating page manifest...
python update_manifest.py
echo.
echo Starting Chemistry Coloring App...
echo.
echo Opening browser at http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
start http://localhost:8000
python -m http.server 8000
