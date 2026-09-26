@echo off
chcp 65001 >nul
title Music Graffiti - 音乐涂鸦

echo ========================================
echo    🎹  Music Graffiti · 音乐涂鸦
echo ========================================
echo.
echo  正在启动本地服务器...
echo  启动后请在浏览器中打开：http://localhost:8080
echo.

cd /d "%~dp0demo"

rem 尝试用 Python 启动
where python >nul 2>nul
if %errorlevel%==0 (
    echo  使用 Python 启动...
    start http://localhost:8080
    python -m http.server 8080
    goto :end
)

rem 尝试用 Python3 启动
where python3 >nul 2>nul
if %errorlevel%==0 (
    echo  使用 Python3 启动...
    start http://localhost:8080
    python3 -m http.server 8080
    goto :end
)

rem 尝试用 Node.js 启动
where npx >nul 2>nul
if %errorlevel%==0 (
    echo  使用 Node.js 启动...
    start http://localhost:3000
    npx serve -l 3000 .
    goto :end
)

echo.
echo  ❌ 没有找到 Python 或 Node.js
echo.
echo  你可以：
echo    1. 直接双击 demo/index.html 打开（功能一样）
echo    2. 安装 Python 3：https://www.python.org/downloads/
echo    3. 安装 Node.js：https://nodejs.org/
echo.
pause

:end
