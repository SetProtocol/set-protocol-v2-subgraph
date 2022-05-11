#!/bin/sh

set -e

# Hosted Service deployment requires ACCESS_TOKEN
if [ "${DEPLOYMENT}" = "hosted" ] && [ ! -n "${ACCESS_TOKEN}" ]; then
  echo "ERROR: Subgraph access token required for hosted deployments."
  exit 1
fi

# Subgraph Studio deployment requires DEPLOY_KEY
if [ "${DEPLOYMENT}" = "studio" ] && [ ! -n "${DEPLOY_KEY}" ]; then
  echo "ERROR: Deploy key required for studio deployments."
  exit 1
fi

# Make sure network name is set for external deployments
if [ "${DEPLOYMENT}" = "hosted" ] || [ "${DEPLOYMENT}" = "studio" ] && [ ! -n "${NETWORK_NAME}" ]; then
    echo "ERROR: No target network specified for hosted deployment."
    exit 1
fi

# Get subgraph name from deployments.json if not user-provided
if [ -z "${SUBGRAPH_NAME}" ]; then
  echo "No SUBGRAPH_NAME specified, getting subgraph name from target graph network in deployments.json"
  export SUBGRAPH_NAME=$(jq -r --arg network "${NETWORK_NAME}" '.[$network].subgraphName' deployments.json)
  if [ -z "${SUBGRAPH_NAME}" ]; then
    echo "ERROR: No valid subgraph name found"
    exit 1
  fi
fi

# Wait for graph-node container
if [ "${DEPLOYMENT}" = "local" ]; then
  bash ./scripts/wait-for-it.sh ${GRAPH_NODE_IP} -t 180 -s
fi

# Generate schema artifacts
sh ./scripts/gen-schema.sh
if [ $? != 0 ]; then
  exit 1
fi

if [ "${DEPLOYMENT}" = "local" ]; then
  # Create and deploy subgraph to local graph node
  echo "Create local subgraph ${GITHUB_REPO}/${SUBGRAPH_NAME}"
  # Set access token param if provided
  if [ -n "${ACCESS_TOKEN+1}" ]; then
    ACCESS_TOKEN_ARG="--access-token ${ACCESS_TOKEN}"
  fi
  # Note: DO NOT quote ACCESS_TOKEN_ARG
  npx graph create "${GITHUB_REPO}/${SUBGRAPH_NAME}" --node "http://${GRAPH_NODE_IP}" ${ACCESS_TOKEN_ARG}
  echo "Deploy local subgraph ${GITHUB_REPO}/${SUBGRAPH_NAME}"
  npx graph deploy -l "${SUBGRAPH_VERSION}" "${GITHUB_REPO}/${SUBGRAPH_NAME}" --ipfs "http://${IPFS_IP}" --node "http://${GRAPH_NODE_IP}" ${ACCESS_TOKEN_ARG}
  echo "Deployment complete (press Ctrl+C to stop)"
elif [ "${DEPLOYMENT}" = "studio" ]; then
  echo "Deploy subgraph ${SUBGRAPH_NAME} version ${SUBGRAPH_VERSION} to Subgraph Studio on network '${NETWORK_NAME}'"
  # Authorize and deploy subgraph to Hosted Service
  npx graph auth --studio "${DEPLOY_KEY}"
  npx graph deploy -l "${SUBGRAPH_VERSION}" --product subgraph-studio "${SUBGRAPH_NAME}"
  echo "Deployment complete"
else
  echo "Deploy subgraph ${GITHUB_REPO}/${SUBGRAPH_NAME} version ${SUBGRAPH_VERSION} to Hosted Service on network '${NETWORK_NAME}'"
  # Authorize and deploy subgraph to Hosted Service
  npx graph auth "${GRAPH_NODE_IP}" "${ACCESS_TOKEN}"
  npx graph deploy -l "${SUBGRAPH_VERSION}" --product hosted-service "${GITHUB_REPO}/${SUBGRAPH_NAME}"
  echo "Deployment complete"
fi
