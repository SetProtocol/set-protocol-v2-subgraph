#!/bin/bash

set -e

# Function to copy contract ABI code into subgraph project
function copy_contracts() {
  local contracts=("$@")
  for cpath in "${contracts[@]}"; do
    local cname=$(echo "${cpath}" | rev | cut -d"/" -f1 | rev)
    echo "Copying contract $cpath.sol/$cname.json"
    cp "$cpath.sol/$cname.json" "/subgraph/abis"
  done
}

# Remove existing ABIs
if [ ! -z "$(ls -A /subgraph/abis)" ]; then
  echo "WARNING: Existing ABIs found. Removing..."
  rm -rf /subgraph/abis/*
fi

## REPO set-protocol-v2 CONTRACTS
## ------------------------------

# Define the path to each contract of interest for the subgraph development
# Note: Path is relative to repo root dir
PROTOCOL_CONTRACTS=(
  "contracts/protocol/Controller"
  "contracts/protocol/SetToken"
  "contracts/protocol/SetTokenCreator"
  "contracts/protocol/modules/v1/StreamingFeeModule"
  "contracts/protocol/modules/v1/TradeModule"
)

# Clone and compile the Set Protocol V2 contracts repo
cd /tmp
ls -al
git clone -q --depth=1 --branch "${PROTOCOL_REPO_BRANCH_OR_TAG}" "${PROTOCOL_REPO_URL}"
ls -al
cd $(echo "${PROTOCOL_REPO_URL}" | rev | cut -d"/" -f1 | rev)
cp .env.default .env
yarn && yarn compile
cd artifacts

# Copy the contract ABI code into the bind mounted working directory
copy_contracts "${PROTOCOL_CONTRACTS[@]}"

## REPO set-v2-strategies CONTRACTS
## --------------------------------

# Define the path to each contract of interest for the subgraph development
# Note: Path is relative to repo root dir
STRATEGIES_CONTRACTS=(
  "contracts/ManagerCore"
  "contracts/factories/DelegatedManagerFactory"
  "contracts/manager/DelegatedManager"
)

# Clone and compile the Set V2 Strategies contracts repo
cd /tmp
git clone -q --depth=1 --branch "${STRATEGIES_REPO_BRANCH_OR_TAG}" "${STRATEGIES_REPO_URL}"
cd $(echo "${STRATEGIES_REPO_URL}" | rev | cut -d"/" -f1 | rev)
cp .env.default .env
yarn && yarn compile
cd artifacts

# Copy the contract ABI code into the bind mounted working directory
copy_contracts "${STRATEGIES_CONTRACTS[@]}"
