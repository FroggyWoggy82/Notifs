# Docker Configuration for Notification Project

This directory contains the Docker configuration files needed to build and run the notification project in a Docker container.

## Files

- `Dockerfile`: The main Docker configuration file that defines how to build the Docker image.
- `.npmrc`: Configuration for npm to help with installing dependencies, especially Sharp.
- `.dockerignore`: Specifies which files should be excluded from the Docker build context.
- `package.json`: The package.json file with simplified scripts for Docker compatibility.

## How to Use

1. Copy these files to the root of your project.
2. Build the Docker image:
   ```bash
   docker build -t notification-project .
   ```
3. Run the Docker container:
   ```bash
   docker run -p 3000:3000 notification-project
   ```

## Troubleshooting

If you encounter issues with the Docker build, particularly with npm ci or Sharp installation:

1. Make sure you're using Node.js 18 or later.
2. Try using `npm install` instead of `npm ci` in the Dockerfile.
3. Check that the .npmrc file is properly copied to the Docker image.
4. Ensure that the build-essential and python3 packages are installed in the Docker image.

## Environment Variables

Make sure to set the necessary environment variables when running the Docker container:

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=your_database_url \
  -e PORT=3000 \
  notification-project
```
