@echo off
REM HBuilderX Chrome启动修复脚本
REM 用于启动一个独立的Chrome实例，避免Google账号登录冲突

echo ==========================================
echo CICI项目 - Chrome启动修复脚本
echo ==========================================

REM 设置Chrome可执行文件路径（请根据实际安装路径修改）
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
set CHROME_PATH_X86="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

REM 检查Chrome是否存在
if exist %CHROME_PATH% (
    set CHROME_EXE=%CHROME_PATH%
    echo 找到Chrome: %CHROME_PATH%
) else if exist %CHROME_PATH_X86% (
    set CHROME_EXE=%CHROME_PATH_X86%
    echo 找到Chrome: %CHROME_PATH_X86%
) else (
    echo 错误: 未找到Chrome浏览器
    echo 请检查Chrome是否已安装或修改脚本中的路径
    pause
    exit /b 1
)

REM 创建临时用户数据目录
set TEMP_PROFILE_DIR=%TEMP%\cici_chrome_profile_%RANDOM%
echo 创建临时用户数据目录: %TEMP_PROFILE_DIR%

REM 启动Chrome参数说明:
REM --user-data-dir: 使用独立的用户数据目录，避免与主Chrome实例冲突
REM --no-default-browser-check: 不检查默认浏览器
REM --disable-default-apps: 禁用默认应用
REM --disable-extensions: 禁用扩展（可选）
REM --disable-plugins-discovery: 禁用插件发现
REM --disable-background-timer-throttling: 禁用后台定时器限制
REM --disable-sync: 禁用同步功能，避免Google账号相关问题
REM --incognito: 隐身模式（可选，进一步隔离）

echo 启动独立Chrome实例...
echo 参数: --user-data-dir="%TEMP_PROFILE_DIR%" --no-default-browser-check --disable-default-apps --disable-sync

REM 启动Chrome
start "CICI开发Chrome" %CHROME_EXE% --user-data-dir="%TEMP_PROFILE_DIR%" --no-default-browser-check --disable-default-apps --disable-sync --disable-background-timer-throttling http://localhost:5173

echo Chrome已启动，使用独立的用户数据目录
echo 此实例不会与您的主Chrome配置和Google账号冲突
echo ==========================================

REM 创建清理脚本
echo @echo off > "%TEMP%\cleanup_cici_chrome.bat"
echo echo 正在清理CICI Chrome临时数据... >> "%TEMP%\cleanup_cici_chrome.bat"
echo timeout /t 3 /nobreak ^> nul >> "%TEMP%\cleanup_cici_chrome.bat"
echo rd /s /q "%TEMP_PROFILE_DIR%" 2^>nul >> "%TEMP%\cleanup_cici_chrome.bat"
echo echo 清理完成 >> "%TEMP%\cleanup_cici_chrome.bat"
echo del "%TEMP%\cleanup_cici_chrome.bat" >> "%TEMP%\cleanup_cici_chrome.bat"

echo 注意: Chrome关闭后，临时数据将被自动清理
echo 如需手动清理，请运行: %TEMP%\cleanup_cici_chrome.bat
echo ==========================================

REM 等待用户确认
echo 按任意键继续...
pause >nul
