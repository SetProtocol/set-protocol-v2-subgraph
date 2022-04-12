# Set Protocol V2 Subgraph

Indexer of Set Protocol v2 events. Built on [The Graph](https://thegraph.com/).

## SETUP

### Requirements:

- Docker >= 20.10

### Local Deployment (Hardhat)

1. Build the Set Protocol Docker base image

   `task docker-build`

1. Deploy a Hardhat node and custom script to the network

   `task deploy-hardhat [-- HARDHAT_STATE_TARGET_REPO HARDHAT_STATE_TEST_SCRIPT]`

   Note: `HARDHAT_STATE_TARGET_REPO` and `HARDHAT_STATE_TEST_SCRIPT` must be provided as input arguments or defined in the dotenv configuration. Input arguments take precendence over dotenv configurations. For input arguments, you can specify just the target repo, or both the repo and test script, but you cannot provide the test script alone.

1. Monitor the Hardhat node until fully deployed and tests are executed

1. In a new terminal, compile the Set Protocol ABIs

   `task gen-abi`

1. Deploy local subgraph

   `task deploy-local`

1. Once deployed, query the subgraph in the browser at http://127.0.0.1:8000/subgraphs/name/GITHUB_REPO/SUBGRAPH_NAME

   Be sure to specify the correct `GITHUB_REPO` and `SUBGRAPH_NAME`. Example queries to run can be found in `samples/sample-query.txt`.

### External Deployment to Hosted Service

1. Build the Set Protocol Docker base image

   `task docker-build`

1. Deploy hosted subgraph to network specified by the `NETWORK_HOSTED` argument

   `task deploy-hosted [-- NETWORK_HOSTED SUBGRAPH_ACCESS_TOKEN]`

   Note: `NETWORK_HOSTED` and `SUBGRAPH_ACCESS_TOKEN` must be provided as input arguments or defined in the dotenv configuration. Input arguments take precendence over dotenv configurations. For input arguments, you can specify just the network, or both the network and the access token, but you cannot provide the access token alone.

**IMPORTANT NOTE**

Per the [documentation](https://thegraph.com/docs/en/hosted-service/deploy-subgraph-hosted/#subgraph-archive-policy) on the Hosted Service:

> A subgraph is defined as "inactive" if it was deployed to the Hosted Service more than 45 days ago, and if it has received 0 queries in the last 30 days.

### [TO-DO] External Deployment to Subgraph Studio

TBD

## USAGE

Available tasks for this project:

| COMMAND [OPTS]                       | DESCRIPTION |
|--------------------------------------|---------------------------------------------------------------------------------|
| `clean [-- all\|subgraph\|hardhat]`  | Clean up local subgraph deployment; `all` arg additionally removes all volumes and the Hardhat node. |
| `deploy-hardhat [-- HARDHAT_STATE_TARGET_REPO HARDHAT_STATE_TEST_SCRIPT]` | Deploy a local Hardhat node from REPO_URL and run a node state deployment test script. `HARDHAT_STATE_TARGET_REPO` and `HARDHAT_STATE_TEST_SCRIPT` must be provided or defined in a private dotenv. |
| `deploy-hosted [-- NETWORK_HOSTED SUBGRAPH_ACCESS_TOKEN]` | Build and deploy subgraph to `NETWORK_HOSTED` on Hosted Service. `NETWORK_HOSTED` and `SUBGRAPH_ACCESS_TOKEN` must be provided or defined in a private dotenv. |
| `deploy-local [-- detach]`           | Build and deploy graph-node and ipfs services on local network followed by deployment of the subgraph; `detach` runs containers in detached mode. |
| `deploy-local-graphnode [-- detach]` | Build and deploy graph-node and ipfs services on local network; `detach` runs containers in detached mode. |
| `deploy-local-subgraph [-- refresh]` | Compile and deploy the subgraph onto running graph-node and ipfs services on local network. `refresh` first deletes all IPFS data and restarts the service. |
| `docker-build`                       | Build Set Protocol base Docker image on defined node version (default: 16-slim). |
| `gen-abi`                            | Pull latest Set Protocol ABIs into the build environment. |
| `gen-schema [-- hosted]`             | Compile the subgraph schema but do not deploy the subgraph; default target subgraph network is local unless `hosted` argument is provided. |

## KEY FILES

`schema.graphql` - Subgraph schema

`templates/subgraph.yaml` - configure watched contracts and events

`deployments.json` - configure deployed contract addresses on each chain

`src/` - [AssemblyScript](https://www.assemblyscript.org) code for subgraph handlers

`src/mappings/` - Event handlers

`src/utils/` - Entity mappings functions and other helper utilities

## REFERENCES

[The Graph Docs](https://thegraph.com/docs/)

[Set Protocol Subgraph Docs](https://app.gitbook.com/o/-MGdl9Y5UCSpZPXC3ad7/s/-MGdlDDRsIRuOJOl7btN/function-tools-and-guides/engineering/development-guides/the-graph)

[Set Protocol V2 Docs](https://docs.tokensets.com/)

[Set Protocol V2 Contracts](https://github.com/SetProtocol/set-protocol-v2)

[Set Protocol V2 Strategies Contracts](https://github.com/SetProtocol/set-v2-strategies)
