# Production Docker build for linux/amd64 (e.g. GitHub Container Registry).
# Run from project root: .\build-docker.ps1
# Avoids PowerShell line-continuation issues with docker build.

$ErrorActionPreference = "Stop"
$image = "ghcr.io/hassanahmed12639/trackhive-portfolio:prod"

docker build --platform=linux/amd64 -t $image -f Dockerfile .

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Build finished. Image: $image"
