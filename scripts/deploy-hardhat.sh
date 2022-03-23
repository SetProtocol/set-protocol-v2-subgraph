#!/bin/bash

set -e

# cd set-protocol-v2
cd set-v2-strategies

if [ ! -f "/tmp/${DEPLOY_SCRIPT}" ]; then
  echo "ERROR: Invalid test script."
  return -1
else
  mkdir -p ./test/subgraph
  cp "/tmp/${DEPLOY_SCRIPT}" ./test/subgraph/
fi

yarn chain --hostname 0.0.0.0 &

# Copy set-protocol-v2 artifacts to populate contract signatures in Hardhat node stack trace
cp -r node_modules/@setprotocol/set-protocol-v2/artifacts/* artifacts/

# Wait for network deployment
bash /app/scripts/wait-for-it.sh "localhost:${HARDHAT_PORT}" -t 20

npx hardhat run --no-compile "./test/subgraph/${DEPLOY_SCRIPT}" --network localhost

# Wait indefinitely to keep node alive
tail -F /dev/null

