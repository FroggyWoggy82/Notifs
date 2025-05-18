#!/bin/bash
set -e

echo "Setting up development environment for Notification Project..."

# Add ~/.local/bin to PATH for Python packages
echo "Adding ~/.local/bin to PATH..."
if ! grep -q "export PATH=\"\$PATH:~/.local/bin\"" ~/.bashrc; then
    echo 'export PATH="$PATH:~/.local/bin"' >> ~/.bashrc
fi

# Add node_modules/.bin to PATH
echo "Adding node_modules/.bin to PATH..."
if ! grep -q "export PATH=\"\$PATH:/mnt/persist/workspace/node_modules/.bin\"" ~/.bashrc; then
    echo 'export PATH="$PATH:/mnt/persist/workspace/node_modules/.bin"' >> ~/.bashrc
fi

# Export current PATH to make Python packages available immediately
export PATH="$PATH:~/.local/bin:/mnt/persist/workspace/node_modules/.bin"

# Install Python dependencies (only numpy for testing)
echo "Installing NumPy for testing..."
pip install --user numpy

echo "Setup completed successfully!"
echo ""
echo "To complete the setup, run the following commands manually:"
echo "1. pip install --user Pillow google-cloud-vision"
echo "2. npm install"
echo ""
echo "The environment is now configured with the necessary PATH settings."