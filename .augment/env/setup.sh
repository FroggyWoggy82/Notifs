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
  "sourceRoot": "$PROJECT_ROOT"
}
EOL
echo "Created .augment-config file at project root"

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

# Install Python dependencies (only numpy for testing)
echo "Installing NumPy for testing..."
pip install --user numpy

echo "Setup completed successfully!"
echo ""
echo "To complete the setup, run the following commands manually:"
echo "1. pip install --user Pillow"
echo "2. npm install"
echo ""
echo "The environment is now configured with the necessary PATH settings."
echo "Project root is set to: $PROJECT_ROOT"