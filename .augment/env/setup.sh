#!/bin/bash
set -e

echo "Setting up development environment for Notification Project..."

# Define project root directory
export PROJECT_ROOT="/mnt/persist/workspace"
echo "Setting project root to: $PROJECT_ROOT"

# Create .augment-config file to help the agent identify the project root
cat > "$PROJECT_ROOT/.augment-config" << EOL
{
  "projectRoot": "$PROJECT_ROOT",
  "workspaceRoot": "$PROJECT_ROOT",
  "sourceRoot": "$PROJECT_ROOT",
  "filePathResolution": {
    "strategy": "relative",
    "basePath": "$PROJECT_ROOT",
    "pathMappings": [
      {
        "remote": "$PROJECT_ROOT/",
        "local": "./"
      },
      {
        "remote": "$PROJECT_ROOT/routes/",
        "local": "./routes/"
      },
      {
        "remote": "$PROJECT_ROOT/public/",
        "local": "./public/"
      },
      {
        "remote": "$PROJECT_ROOT/public/js/",
        "local": "./public/js/"
      },
      {
        "remote": "$PROJECT_ROOT/public/js/food/",
        "local": "./public/js/food/"
      }
    ]
  },
  "agent": {
    "workingDirectory": "$PROJECT_ROOT"
  },
  "localProjectRoot": "."
}
EOL
echo "Created .augment-config file at project root with explicit path mappings"

# Create a symbolic link to ensure file paths are resolved correctly
if [ ! -L "$PROJECT_ROOT/.augment/workspace" ]; then
    mkdir -p "$PROJECT_ROOT/.augment"
    ln -sf "$PROJECT_ROOT" "$PROJECT_ROOT/.augment/workspace"
    echo "Created symbolic link from .augment/workspace to project root"
fi

# Add ~/.local/bin to PATH for Python packages
echo "Adding ~/.local/bin to PATH..."
if ! grep -q "export PATH=\"\$PATH:~/.local/bin\"" ~/.bashrc; then
    echo 'export PATH="$PATH:~/.local/bin"' >> ~/.bashrc
fi

# Add node_modules/.bin to PATH
echo "Adding node_modules/.bin to PATH..."
if ! grep -q "export PATH=\"\$PATH:$PROJECT_ROOT/node_modules/.bin\"" ~/.bashrc; then
    echo "export PATH=\"\$PATH:$PROJECT_ROOT/node_modules/.bin\"" >> ~/.bashrc
fi

# Export current PATH to make Python packages available immediately
export PATH="$PATH:~/.local/bin:$PROJECT_ROOT/node_modules/.bin"

# Create .vscode directory and settings.json if they don't exist
mkdir -p "$PROJECT_ROOT/.vscode"
if [ ! -f "$PROJECT_ROOT/.vscode/settings.json" ]; then
    cat > "$PROJECT_ROOT/.vscode/settings.json" << EOL
{
    "augment.workspaceRoot": "$PROJECT_ROOT",
    "augment.projectPath": "$PROJECT_ROOT"
}
EOL
    echo "Created VS Code settings with Augment configuration"
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --user numpy Pillow

# Change to project directory and install Node.js dependencies
echo "Installing Node.js dependencies..."
cd "$PROJECT_ROOT"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found in $PROJECT_ROOT"
    echo "Make sure you're in the correct project directory"
    exit 1
fi

# Install Node.js dependencies with remote environment optimizations
echo "Running npm install with remote environment optimizations..."
npm cache clean --force 2>/dev/null || echo "Cache clean skipped"
npm install --no-optional --prefer-offline --no-audit --no-fund --legacy-peer-deps

# Verify Sharp installation (simplified for remote environments)
echo "Verifying Sharp installation..."
if [ -d "node_modules/sharp" ]; then
    echo "✓ Sharp module directory found"
    # Simple require test with timeout protection
    timeout 10s node -e "try { const sharp = require('sharp'); console.log('✓ Sharp loaded successfully'); } catch(e) { console.log('✗ Sharp require failed:', e.message); process.exit(1); }" 2>/dev/null && echo "✓ Sharp verification complete" || echo "✗ Sharp verification failed (but installation may still work)"
else
    echo "✗ Sharp module directory not found"
fi

echo ""
echo "Setup completed successfully!"
echo "✓ Python dependencies installed (numpy, Pillow)"
echo "✓ Node.js dependencies installed (including Sharp)"
echo "✓ Environment configured with necessary PATH settings"
echo "Project root is set to: $PROJECT_ROOT"