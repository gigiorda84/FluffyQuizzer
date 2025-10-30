#!/bin/bash
set -e

# Run the build
npm run build

# Create Vercel output directory structure
mkdir -p .vercel/output

# Create config.json
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3
}
EOF

# Copy static files
mkdir -p .vercel/output/static
cp -r dist/public/* .vercel/output/static/

# Create serverless function
mkdir -p .vercel/output/functions/index.func
cp dist/index.prod.js .vercel/output/functions/index.func/index.js

# Create function config
cat > .vercel/output/functions/index.func/.vc-config.json << 'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.js",
  "launcherType": "Nodejs",
  "maxDuration": 10
}
EOF

echo "Build completed successfully!"
