# aelf-bridge-demo

## Introduction

This repo is a simple demo of how to use `aelf-bridge`.

## Installation

```bash
# using npm
npm i
# using yarn
yarn
```

## Development

### Debugging Dapp with `aelf-command`

Since there are two ways Dapp can communicate with the AElf chain, `aelf-command` provides the `socket` way.

1. start Dapp server in `aelf-command`

    You need to install `aelf-command` before next step.
    ```bash
    npm i aelf-command -g
    ```
    start the Dapp server
    ```bash
    aelf-command dapp-server
    ```
    by default, the Dapp server will listen on port `35443`

2. start webpack

    In project directory
    ```bash
    npm run dev
    ```
   open the page `http://0.0.0.0:9527/dapp.html`.

### Debugging Dapp with iframe

1. add chain node url in `.env`
    ```bash
    touch .env
    ```
    add your own `END_POINT`
    ```dotenv
    END_POINT=http://127.0.0.1:8000
    ```

2. start webpack

    Firstly, init `aelf-bridge` with post message channel
        ```javascript
        const bridgeInstance = new AElfBridge();
        ```
    In project directory
    ```bash
    npm run dev
    ```
    open the page `http://0.0.0.0:9527/container.html`. When you inspect this page, you can find an iframe inside the HTML,
    the iframe holds the `dapp` page.

    There are two pages in this repo, as you can see in the directory `src/pages/`, there are `dapp` and `dappContainer`.

    Since Dapp needs to interact with Native apps which holds wallet info, we provide `dappContainer` to support your development.
    Think `dappContainer` is a wallet App, which hold the wallet info and can interact with `AElf` chain node directly.
    And it provides the abilities to support Dapp communication. Any Developers can use this page as the Native app to develop Dapp.

    `dappContainer` uses iframe and rewrite iframe's `postMessage`, so `dapp` can send messages to `dappContainer`

    `dapp` is a simple Dapp demo which uses `aelf-bridge` to interact with `dappContainer`, you can take it as an example and write your own code.


