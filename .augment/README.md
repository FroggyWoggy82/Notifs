# Augment Remote Agent Setup

This directory contains configuration files for the Augment Remote Agent to properly work with this project.

## Configuration Files

1. **env/setup.sh**: 
   - Sets up the remote environment
   - Configures project root paths
   - Creates symbolic links for proper file resolution
   - Sets up VS Code settings

2. **/.augment-config.json**:
   - Located at the project root
   - Defines project paths for the Augment Remote Agent
   - Configures file path resolution strategy

3. **/.vscode/settings.json**:
   - Configures VS Code settings for the Augment extension
   - Ensures proper file path resolution

## Troubleshooting

If the Augment Remote Agent is still creating files outside the project folder:

1. Make sure you're using the latest version of the Augment Remote Code extension
2. Try restarting VS Code after applying these changes
3. When creating a new remote agent, select "Use basic environment" and ensure the repository and branch are correct
4. Check the logs in the Output panel (View > Output > Augment) for any error messages

## Manual Fix

If files are still being created outside the project folder, you can manually copy the changes from the diff view to the correct files within your project.
