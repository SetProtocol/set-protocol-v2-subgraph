#!/bin/bash

set -e

# Set up target repo

if [ -z "${REPO_URL}" ]; then
  echo "ERROR: No target repository"
  exit 1
fi

export REPO_DIR=$(echo "${REPO_URL}" | rev | cut -d"/" -f1 | rev)

echo "Setting up ${REPO_DIR} on branch/tag ${REPO_BRANCH_OR_TAG}..."

if [ ! -d "${REPO_DIR}" ]; then
  git clone -q --branch "${REPO_BRANCH_OR_TAG}" "${REPO_URL}"
  cd "${REPO_DIR}"
  # Set up default env vars as required
  if [ ! -f ".env" ]; then
      cp .env.default .env
  fi
  # Install dependencies
  yarn install
else
  cd "${REPO_DIR}"
  # Switch to target branch/tag and get latest updates
  git fetch origin "${REPO_BRANCH_OR_TAG}"
  git checkout "${REPO_BRANCH_OR_TAG}"
fi

if [ ! -f "${TEST_SCRIPT}" ]; then
  echo "ERROR: Invalid test script."
  exit 1
fi

echo "Deploying Hardhat node..."

# Spin up Hardhat chain
yarn chain --hostname 0.0.0.0 &

if [ "${REPO_DIR}" = "set-v2-strategies" ]; then
  # Copy set-protocol-v2 artifacts to populate contract signatures in Hardhat node stack trace
  cp -r node_modules/@setprotocol/set-protocol-v2/artifacts/* artifacts/
fi

# Wait for network deployment
bash /app/scripts/wait-for-it.sh "localhost:${HARDHAT_PORT}" -t 20

echo "Running ${TEST_SCRIPT}..."

npx hardhat run --no-compile "${TEST_SCRIPT}" --network localhost

# Wait indefinitely to keep node alive
tail -F /dev/null
