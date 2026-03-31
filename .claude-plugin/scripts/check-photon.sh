#!/bin/bash
# Check if Photon CLI is installed, install if missing

# Check if photon command exists and is from @portel/photon
if command -v photon &> /dev/null; then
  # Verify it's the right package by checking if it has the expected commands
  if photon --version &> /dev/null && photon get --help &> /dev/null 2>&1; then
    # Photon CLI is installed and working
    exit 0
  fi
fi

# Photon not found or not working, install it
echo "📦 Installing Photon CLI..." >&2
if command -v bun &> /dev/null; then
  bun add -g @portel/photon &> /dev/null
else
  npm install -g @portel/photon &> /dev/null
fi

if [ $? -eq 0 ]; then
  echo "✅ Photon CLI installed successfully" >&2
else
  echo "❌ Failed to install Photon CLI. Please run: npx @portel/photon --help" >&2
  exit 1
fi
