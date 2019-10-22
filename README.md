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

```bash
npm run dev
```

This will open a server listen on port 9527, open the page `http://0.0.0.0:9527/container.html`. When you inspect this page, you can find an iframe inside the HTML,
the iframe holds the `dapp` page.

There are two pages in this repo, as you can see in the directory `src/pages/`, there are `dapp` and `dappContainer`.

Since Dapp need to interact with Native apps which holds wallet info, we provide `dappContainer` to support your development.
Think `dappContainer` is a wallet App, which hold the wallet info and can interact with `AElf` chain node directly.
And it provides the abilities to support Dapp communication. Any Developers can use this page as the Native app to develop Dapp.

`dappContainer` use iframe and rewrite iframe's `postMessage`, so `dapp` can send message to `dappContainer`

`dapp` is a simple Dapp demo which uses `aelf-bridge` to interact with `dappContainer`, you can use this page to write your own code.

