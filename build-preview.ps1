$root = $PSScriptRoot
$includesDir = Join-Path $root "_includes"
$outDir = Join-Path $root "preview"

if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

function Resolve-Includes($content) {
    $pattern = '\{\%\s*include\s+([^\s%]+)((?:\s+\w+="[^"]*")*)\s*\%\}'
    $matches = [regex]::Matches($content, $pattern)

    foreach ($m in $matches) {
        $includeFile = $m.Groups[1].Value
        $paramsRaw = $m.Groups[2].Value
        $includePath = Join-Path $includesDir $includeFile

        if (!(Test-Path $includePath)) {
            Write-Warning "Missing include: $includeFile"
            continue
        }

        $includeContent = Get-Content $includePath -Raw

        $paramMatches = [regex]::Matches($paramsRaw, '(\w+)="([^"]*)"')
        foreach ($p in $paramMatches) {
            $key = $p.Groups[1].Value
            $val = $p.Groups[2].Value
            $includeContent = $includeContent -replace "\{\{\s*include\.$key\s*\}\}", $val
        }

        $content = $content.Replace($m.Value, $includeContent)
    }
    return $content
}

Get-ChildItem -Path $root -Filter "*.html" -File | ForEach-Object {
    $raw = Get-Content $_.FullName -Raw
    $raw = $raw -replace '(?s)^---.*?---\s*', ''

    $processed = Resolve-Includes $raw
    $processed = Resolve-Includes $processed

    $outPath = Join-Path $outDir $_.Name
    Set-Content -Path $outPath -Value $processed -Encoding UTF8
    Write-Host "Built: $($_.Name)"
}

Copy-Item -Path (Join-Path $root "assets") -Destination $outDir -Recurse -Force
Write-Host "`nBuild complete -> $outDir"
