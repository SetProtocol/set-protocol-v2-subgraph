#!/bin/bash

set -e

PROTOCOL_REPO_URL="https://github.com/SetProtocol/set-protocol-v2"
STRATEGIES_REPO_URL="https://github.com/SetProtocol/set-v2-strategies"

# Remove existing ABIs
if [ ! -z "$(ls -A /subgraph/abis)" ]; then
  echo "WARNING: Existing ABIs found. Removing..."
  rm -rf /subgraph/abis/*
fi

# Clone and compile the Set Protocol V2 contracts repo
cd /tmp
git clone -q --depth=1 "${PROTOCOL_REPO_URL}"
cd $(echo "${PROTOCOL_REPO_URL}" | rev | cut -d"/" -f1 | rev)
cp .env.default .env
yarn && yarn compile
cd artifacts

# Define the Set contracts of interest for the subgraph development
PROTOCOL_CONTRACTS=(
  SetToken
  SetTokenCreator
)

# Define the Set module contracts of interest for the subgraph development
V1_MODULE_CONTRACTS=(
  IssuanceModule
  StreamingFeeModule
  TradeModule
)

# Copy the contract ABI code into the bind mounted working directory
for c in "${PROTOCOL_CONTRACTS[@]}"; do
  cp "contracts/protocol/$c.sol/$c.json" "/subgraph/abis"
done
for c in "${V1_MODULE_CONTRACTS[@]}"; do
  cp "contracts/protocol/modules/v1/$c.sol/$c.json" "/subgraph/abis"
done

# Clone and compile the Set V2 Strategies contracts repo
cd /tmp
git clone -q --depth=1 "${STRATEGIES_REPO_URL}"
cd $(echo "${STRATEGIES_REPO_URL}" | rev | cut -d"/" -f1 | rev)
cp .env.default .env
yarn && yarn compile
cd artifacts

# Define the Set manager factory contracts of interest for the subgraph development
MANAGER_CORE_CONTRACTS=(
  ManagerCore
)

MANAGER_FACTORY_CONTRACTS=(
  DelegatedManagerFactory
)

MANAGER_CONTRACTS=(
  DelegatedManager
)

GLOBAL_EXTENSION_CONTRACTS=(
  IssuanceExtension
  StreamingFeeSplitExtension
  TradeExtension
)

# Copy the contract ABI code into the bind mounted working directory
for c in "${MANAGER_CORE_CONTRACTS[@]}"; do
  cp "contracts/$c.sol/$c.json" "/subgraph/abis"
done
for c in "${MANAGER_FACTORY_CONTRACTS[@]}"; do
  cp "contracts/factories/$c.sol/$c.json" "/subgraph/abis"
done
for c in "${MANAGER_CONTRACTS[@]}"; do
  cp "contracts/manager/$c.sol/$c.json" "/subgraph/abis"
done
for c in "${GLOBAL_EXTENSION_CONTRACTS[@]}"; do
  cp "contracts/extensions/$c.sol/$c.json" "/subgraph/abis"
done