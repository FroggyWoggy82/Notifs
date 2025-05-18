# Augment Remote Agent Setup

This directory contains configuration files for the Augment Remote Agent to properly work with this project.

## Configuration Files

1. **env/setup.sh**:
   - Sets up the remote environment
   - Configures project root paths with explicit path mappings
   - Creates symbolic links for proper file resolution
   - Sets up VS Code settings

2. **/.augment-config.json**:
   - Located at the project root
   - Defines project paths for the Augment Remote Agent
   - Configures file path resolution strategy with explicit path mappings
   - Maps remote paths to local paths

3. **/.vscode/settings.json**:
   - Configures VS Code settings for the Augment extension
   - Ensures proper file path resolution with explicit path mappings

4. **/.augment/project-root-marker**:
   - Helps the Augment Remote Agent identify the project root directory

## How to Use

1. When creating a new remote agent:
   - Select "Use basic environment" in the setup options
   - Make sure the repository and branch are correct
   - Wait for the setup script to complete

2. When applying changes:
   - Review the diff carefully
   - Make sure the paths in the diff match your local project structure
   - If the paths look correct, click "Apply" to apply the changes

## Troubleshooting

If the Augment Remote Agent is still creating files outside the project folder:

1. **Check the configuration**:
   - Make sure all configuration files are in the correct locations
   - Verify that the path mappings in `.augment-config.json` and `.vscode/settings.json` are correct

2. **Restart VS Code and the Remote Agent**:
   - Close VS Code completely
   - Reopen VS Code and your project
   - Delete any existing remote agents
   - Create a new remote agent

3. **Check for errors**:
   - Look at the Output panel (View > Output > Augment) for any error messages
   - Check the terminal output when the remote agent is being created

4. **Contact Augment Support**:
   - If the issue persists, contact Augment support with details of your setup
   - Include the configuration files and any error messages

## Manual Fix

If files are still being created outside the project folder:

1. **Copy changes manually**:
   - In the diff view, copy the content of the changes
   - Manually paste them into the correct files in your project

2. **Use relative paths**:
   - When the remote agent suggests changes, look for the relative path
   - Apply the changes to the corresponding file in your local project
