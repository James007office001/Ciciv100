# Fix AWS Credentials - Replace real credentials with placeholders
Write-Host "Starting AWS credentials fix..." -ForegroundColor Yellow

# Define patterns to replace
$accessKeyPattern = 'YOUR_AWS_ACCESS_KEY_ID'
$secretKeyPattern = 'YOUR_AWS_SECRET_ACCESS_KEY'

# Replacement placeholders
$accessKeyReplacement = 'YOUR_AWS_ACCESS_KEY_ID'
$secretKeyReplacement = 'YOUR_AWS_SECRET_ACCESS_KEY'

# Get all files containing AWS credentials
$files = Get-ChildItem -Path . -Recurse -Include "*.ps1", "*.md" | Where-Object { 
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    $content -match $accessKeyPattern -or $content -match $secretKeyPattern
}

Write-Host "Found $($files.Count) files containing AWS credentials" -ForegroundColor Cyan

foreach ($file in $files) {
    Write-Host "Fixing: $($file.Name)" -ForegroundColor Green
    
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace $accessKeyPattern, $accessKeyReplacement
    $content = $content -replace $secretKeyPattern, $secretKeyReplacement
    
    # Write back to file
    $content | Set-Content $file.FullName -NoNewline
}

Write-Host "AWS credentials fix completed!" -ForegroundColor Green
Write-Host "All real AWS credentials replaced with placeholders" -ForegroundColor Yellow
