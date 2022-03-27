#!/bin/bash

set -e

ROOT_DIR=$(pwd)

# if [ ! -d "set-protocol-v2" ]; then
#     git clone -q https://github.com/SetProtocol/set-protocol-v2.git
# fi

# cd "${ROOT_DIR}/set-protocol-v2"

# # Set up default env vars as required
# if [ ! -f ".env" ]; then
#     cp .env.default .env
# fi

# # Install the dependencies
# yarn install

if [ ! -d "set-v2-strategies" ]; then
    git clone -q https://github.com/SetProtocol/set-v2-strategies.git
fi

cd "${ROOT_DIR}/set-v2-strategies"

# Set up default env vars as required
if [ ! -f ".env" ]; then
    cp .env.default .env
fi

# Install the dependencies
yarn install
