# Release Scripts

This directory contains scripts for automating the release process of the VSCode Control4 Extension.

## Available Tasks

### 1. Release: Commit, Version Bump & Build VSIX
- **Purpose**: Complete release process with interactive prompts
- **Usage**: Run from VS Code command palette (`Ctrl+Shift+P` → "Tasks: Run Task")
- **Behavior**: 
  - Checks for uncommitted changes
  - Prompts for commit message if changes exist
  - Commits changes
  - Bumps patch version (default)
  - Builds extension
  - Creates VSIX file
  - Commits version bump

### 2. Release: Patch Version
- **Purpose**: Quick patch release (bug fixes)
- **Usage**: Run from VS Code command palette
- **Behavior**: Same as above but automatically bumps patch version

### 3. Release: Minor Version
- **Purpose**: Minor release (new features, backward compatible)
- **Usage**: Run from VS Code command palette
- **Behavior**: Same as above but bumps minor version

### 4. Release: Major Version
- **Purpose**: Major release (breaking changes)
- **Usage**: Run from VS Code command palette
- **Behavior**: Same as above but bumps major version

### 5. Build VSIX Only
- **Purpose**: Build VSIX without version bumping or committing
- **Usage**: Run from VS Code command palette
- **Behavior**: Builds extension and creates VSIX file

## PowerShell Script: `release.ps1`

The main release script that handles the complete release process.

### Parameters

- `-CommitMessage`: Optional commit message (if not provided, will prompt)
- `-VersionBump`: Version bump type ("patch", "minor", "major") - defaults to "patch"

### Usage Examples

```powershell
# Interactive release (prompts for commit message)
.\scripts\release.ps1

# Release with specific commit message
.\scripts\release.ps1 -CommitMessage "Fix bug in property editor"

# Release with minor version bump
.\scripts\release.ps1 -VersionBump minor -CommitMessage "Add new feature"

# Release with major version bump
.\scripts\release.ps1 -VersionBump major -CommitMessage "Breaking changes"
```

### What the Script Does

1. **Git Status Check**: Verifies git is available and checks for uncommitted changes
2. **Commit Changes**: If changes exist, commits them with provided message
3. **Version Bump**: Updates version in `package.json` based on bump type
4. **Build Extension**: Runs `npm run build` to compile the extension
5. **Create VSIX**: Uses `vsce package` to create the VSIX file
6. **Commit Version**: Commits the version bump to git
7. **Success Report**: Shows the created VSIX file and new version

### Requirements

- Git must be installed and available in PATH
- Node.js and npm must be installed
- `vsce` must be installed globally (`npm install -g vsce`)
- PowerShell execution policy must allow script execution

### Error Handling

The script includes comprehensive error handling:
- Checks for required tools (git, vsce)
- Validates git status
- Ensures build success before VSIX creation
- Provides clear error messages with colored output
- Exits with appropriate error codes on failure

### Output

The script provides colored, emoji-enhanced output to make it easy to follow the release process:
- 🚀 Starting process
- 📝 Found changes
- 💾 Committing
- 📦 Version bumping
- 🔨 Building
- ✅ Success indicators
- ❌ Error indicators

## Version Bumping Logic

- **Patch**: Increments patch number (1.2.3 → 1.2.4)
- **Minor**: Increments minor number, resets patch (1.2.3 → 1.3.0)
- **Major**: Increments major number, resets minor and patch (1.2.3 → 2.0.0)

## VSIX File Naming

The generated VSIX file follows the pattern: `vscode-control4-{version}.vsix`

Example: `vscode-control4-0.2.0.vsix` 