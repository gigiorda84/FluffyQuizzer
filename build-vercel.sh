#!/bin/bash
set -e

# Build frontend
vite build

# Build Vercel serverless function (without app.listen)
esbuild server/index.vercel.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

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
cp dist/index.vercel.js .vercel/output/functions/index.func/index.mjs
cp -r dist/public .vercel/output/functions/index.func/

# Create function config
cat > .vercel/output/functions/index.func/.vc-config.json << 'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.mjs",
  "launcherType": "Nodejs",
  "maxDuration": 10
}
EOF

echo "Build completed successfully!"
