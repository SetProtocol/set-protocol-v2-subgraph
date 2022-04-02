#!/bin/sh

if [ -d "./build" ]; then
  rm -rf ./build
fi

if [ -d "./generated" ]; then
  rm -rf ./generated
fi

# Install node dependencies (note: into named Docker volume, not on bind mount to host)
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
npm install --no-save --include=dev typescript ts-node handlebars @graphprotocol/graph-cli @graphprotocol/graph-ts

# Instantiate the environment based on target network (e.g., hardhat, hosted)
npx ts-node ./scripts/generate-deployment.ts ${NETWORK_NAME}

if [ $? != 0 ]; then
  echo "ERROR: Failed to generate deployment"
  exit 1
fi

# Run graph codegen to produce intermediate artifacts for development
npx graph codegen
