[CmdletBinding()]
param([string]$PastaDoSite = $PSScriptRoot, [switch]$Publicar)

$ErrorActionPreference = 'Stop'
$team = 'dra-marcela-camargo'
$projectName = 'site-marcela-camargo'
$teamId = 'team_vtVatLeMRAtnxEaXo9tmIcLP'
$projectId = 'prj_X4zRkPYKCk4ZiNgXyCRwsJdYZPP7'
$sourcePath = $PastaDoSite
$credentialDirectory = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'VercelCLI-DraMarcela'
$vercel = (Get-Command vercel.cmd -ErrorAction Stop).Source
$vercelOptions = @('--scope', $team, '--global-config', $credentialDirectory, '--no-color', '--non-interactive')
$temporaryRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$temporaryName = 'site-marcela-camargo-' + [Guid]::NewGuid().ToString('N')
$stagingPath = Join-Path $temporaryRoot $temporaryName
$environment = @{}

try {
    # Use only the dedicated Vercel login. Ignore other project links and Git remotes.
    foreach ($name in @('VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID', 'GIT_DIR', 'GIT_WORK_TREE')) {
        $environment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
        [Environment]::SetEnvironmentVariable($name, $null, 'Process')
    }
    $environment['NO_UPDATE_NOTIFIER'] = $env:NO_UPDATE_NOTIFIER
    $env:NO_UPDATE_NOTIFIER = '1'

    $projectJson = & $vercel api "/v9/projects/$projectId" --raw @vercelOptions
    if ($LASTEXITCODE -ne 0) { throw "Nao foi possivel acessar o projeto $team/$projectName com a sessao da Dra. Marcela." }
    $project = $projectJson | ConvertFrom-Json
    if ($project.name -ne $projectName -or $project.id -ne $projectId -or $project.accountId -ne $teamId) {
        throw 'O projeto retornado pela Vercel nao corresponde ao destino esperado.'
    }

    $sourcePath = (Get-Item -LiteralPath $sourcePath).FullName
    if (!(Test-Path -LiteralPath (Join-Path $sourcePath 'index.html') -PathType Leaf)) {
        throw 'index.html nao foi encontrado na pasta do site.'
    }
    $publicDirectories = @('assets', 'css', 'js') | ForEach-Object { Join-Path $sourcePath $_ }
    $assetExtensions = @('.css', '.js', '.mjs', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.ico', '.mp4', '.webm', '.mp3', '.ogg', '.woff', '.woff2', '.ttf', '.otf', '.pdf')
    $publicFiles = @(
        Get-ChildItem -LiteralPath $sourcePath -File | Where-Object {
            $_.Extension -in @('.html', '.htm') -or $_.Name -in @('robots.txt', 'sitemap.xml', 'favicon.ico', 'manifest.webmanifest')
        }
        Get-ChildItem -LiteralPath $publicDirectories -File -Recurse | Where-Object {
            $_.Extension -in $assetExtensions
        }
    )

    [void](New-Item -ItemType Directory -Path $stagingPath)
    foreach ($file in $publicFiles) {
        $relativePath = $file.FullName.Substring($sourcePath.Length + 1)
        if ($relativePath -match '(^|[\\/])\.') { continue }
        $destination = Join-Path $stagingPath $relativePath
        [void][System.IO.Directory]::CreateDirectory((Split-Path -Parent $destination))
        Copy-Item -LiteralPath $file.FullName -Destination $destination
    }

    $deployOptions = @($stagingPath, '--project', $projectId)
    if ($Publicar) {
        $deployOptions += '--prod'
    } else {
        $deployOptions += @('--dry', '--format=json')
    }
    & $vercel deploy @deployOptions @vercelOptions
    if ($LASTEXITCODE -ne 0) { throw 'A CLI da Vercel nao concluiu a operacao.' }
} finally {
    foreach ($name in $environment.Keys) {
        [Environment]::SetEnvironmentVariable($name, $environment[$name], 'Process')
    }
    if (Test-Path -LiteralPath $stagingPath -PathType Container) {
        $resolvedStage = (Resolve-Path -LiteralPath $stagingPath).ProviderPath
        if ((Split-Path -Parent $resolvedStage) -eq $temporaryRoot.TrimEnd('\', '/') -and
            (Split-Path -Leaf $resolvedStage) -eq $temporaryName) {
            try {
                Remove-Item -LiteralPath $resolvedStage -Recurse -Force -ErrorAction Stop
            } catch {
                Write-Warning "O Windows manteve aberta a pasta temporaria: $resolvedStage"
            }
        }
    }
}
