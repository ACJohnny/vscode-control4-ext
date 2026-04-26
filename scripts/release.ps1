# Release script for VSCode Control4 Extension
# This script commits changes, bumps version, and builds a VSIX file

param(
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("patch", "minor", "major")]
    [string]$VersionBump = "patch"
)

Write-Host "Starting VSCode Control4 Extension Release Process..." -ForegroundColor Green

# Function to check if git is available
function Test-GitAvailable {
    try {
        git --version | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check git status
function Test-GitStatus {
    $status = git status --porcelain
    if ($status) {
        Write-Host "Found uncommitted changes:" -ForegroundColor Yellow
        Write-Host $status -ForegroundColor Gray
        return $true
    } else {
        Write-Host "No uncommitted changes found" -ForegroundColor Green
        return $false
    }
}

# Function to get current version
function Get-CurrentVersion {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    return $packageJson.version
}

# Function to bump version
function Update-Version {
    param([string]$BumpType)
    
    Write-Host "Bumping version ($BumpType)..." -ForegroundColor Yellow
    
    # Read current version
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $currentVersion = $packageJson.version
    
    # Parse version
    $versionParts = $currentVersion.Split('.')
    $major = [int]$versionParts[0]
    $minor = [int]$versionParts[1]
    $patch = [int]$versionParts[2]
    
    # Bump version based on type
    switch ($BumpType) {
        "major" { 
            $major++
            $minor = 0
            $patch = 0
        }
        "minor" { 
            $minor++
            $patch = 0
        }
        "patch" { 
            $patch++
        }
    }
    
    $newVersion = "$major.$minor.$patch"
    Write-Host "Version: $currentVersion -> $newVersion" -ForegroundColor Cyan
    
    # Update package.json
    $packageJson.version = $newVersion
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    
    return $newVersion
}

# Function to build VSIX
function Build-VSIX {
    param([string]$Version)
    
    Write-Host "Building VSIX file..." -ForegroundColor Yellow
    
    # Build the extension first
    Write-Host "Building extension..." -ForegroundColor Gray
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed!" -ForegroundColor Red
        exit 1
    }
    
    # Build VSIX
    Write-Host "Creating VSIX package..." -ForegroundColor Gray
    vsce package
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "VSIX creation failed!" -ForegroundColor Red
        exit 1
    }
    
    $vsixFile = "vscode-control4-$Version.vsix"
    if (Test-Path $vsixFile) {
        $fileSize = (Get-Item $vsixFile).Length / 1MB
        $fileSizeRounded = [math]::Round($fileSize, 2)
        Write-Host ("VSIX created successfully: {0} ({1} MB)" -f $vsixFile, $fileSizeRounded) -ForegroundColor Green
    } else {
        Write-Host "VSIX file not found!" -ForegroundColor Red
        exit 1
    }
}

# Main execution
try {
    # Check if git is available
    if (-not (Test-GitAvailable)) {
        Write-Host "Git is not available. Please install Git and try again." -ForegroundColor Red
        exit 1
    }
    
    # Check git status
    $hasChanges = Test-GitStatus
    
    # If no commit message provided, prompt for one
    if (-not $CommitMessage -and $hasChanges) {
        $CommitMessage = Read-Host "Enter commit message"
        if (-not $CommitMessage) {
            Write-Host "Commit message is required when there are changes." -ForegroundColor Red
            exit 1
        }
    }
    
    # Commit changes if any
    if ($hasChanges) {
        Write-Host "Committing changes..." -ForegroundColor Yellow
        git add .
        git commit -m $CommitMessage
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Commit failed!" -ForegroundColor Red
            exit 1
        }
        Write-Host "Changes committed successfully" -ForegroundColor Green
    }
    
    # Get current version
    $currentVersion = Get-CurrentVersion
    Write-Host "Current version: $currentVersion" -ForegroundColor Cyan
    
    # Bump version
    $newVersion = Update-Version -BumpType $VersionBump
    
    # Build VSIX
    Build-VSIX -Version $newVersion
    
    # Commit version bump
    Write-Host "Committing version bump..." -ForegroundColor Yellow
    git add package.json
    git commit -m "Bump version to $newVersion"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Version bump commit failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Version bump committed successfully" -ForegroundColor Green
    
    # Success message
    Write-Host "Release process completed successfully!" -ForegroundColor Green
    Write-Host "VSIX file: vscode-control4-$newVersion.vsix" -ForegroundColor Cyan
    Write-Host "Version: $newVersion" -ForegroundColor Cyan
    
} catch {
    Write-Host "An error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 