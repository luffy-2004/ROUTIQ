Stop-Process -Id 1464,1940,13888 -Force -ErrorAction SilentlyContinue
$backend = 'C:\Users\anant\Downloads\Routiq-final-main\Routiq-final-main\server\start-backend.bat'
$frontend = 'C:\Users\anant\Downloads\Routiq-final-main\Routiq-final-main\start-frontend.bat'
$backendArgs = @('/c','start','Backend',$backend)
$frontendArgs = @('/c','start','Frontend',$frontend)
Start-Process -FilePath 'C:\Windows\System32\cmd.exe' -ArgumentList $backendArgs
Start-Process -FilePath 'C:\Windows\System32\cmd.exe' -ArgumentList $frontendArgs
