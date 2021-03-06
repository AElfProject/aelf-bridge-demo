/**
 * @file dapp app
 * @author atom-yang
 */
import React, { useEffect, useState } from 'react';
import { Button } from 'antd-mobile';
import AElf from 'aelf-sdk';
import AElfBridge from 'aelf-bridge';
import './index.less';

const App = () => {
  const [aelf, setAelf] = useState(null);
  const [result, setResult] = useState({});
  const [contract, setContract] = useState(null);
  useEffect(() => {
    // use socket.io
    // const bridgeInstance = new AElfBridge({
    //   proxyType: 'SOCKET.IO',
    //   socketUrl: 'http://localhost:35443'
    // });
    // use postMessage
    const bridgeInstance = new AElfBridge();
    setAelf(bridgeInstance);
  }, []);
  function connect() {
    aelf.connect().then(setResult).catch(setResult);
  }

  function getChainStatus() {
    // aelf.api({
    //   apiPath: '/api/blockChain/chainStatus', // api路径
    //   arguments: []
    // }).then(res => {
    //   setResult(res);
    // }).catch(err => {
    //   console.log(err);
    //   setResult(err);
    // });
    aelf.chain.getChainStatus().then(res => {
      setResult(res);
    }).catch(err => {
      console.log(err);
      setResult(err);
    });
  }

  function getChainHeight() {
    aelf.chain.getBlockHeight().then(height => {
      aelf.chain.getBlockByHeight(height, true).then(res => {
        setResult(res);
      }).catch(err => {
        console.error(err);
      });
    });
  }

  async function getNativeTokenInfo() {
    const chainStatus = await aelf.chain.getChainStatus();
    const { GenesisContractAddress } = chainStatus;
    const zero = await aelf.chain.contractAt(GenesisContractAddress);
    console.log(zero);
    const tokenAddress = await zero.GetContractAddressByName.call(AElf.utils.sha256('AElf.ContractNames.Token'));
    console.log(tokenAddress);
    const token = await aelf.chain.contractAt(tokenAddress);
    console.log(token);
    setContract(token);
    setResult(await token.GetTokenInfo.call({
      symbol: 'ELF'
    }));
  }

  function getAccountInfo() {
    aelf.account().then(setResult).catch(err => {
      console.error(err);
    });
  }

  async function getContract() {
    if (!contract) {
      const chainStatus = await aelf.chain.getChainStatus();
      const { GenesisContractAddress } = chainStatus;
      const zero = await aelf.chain.contractAt(GenesisContractAddress);
      const tokenAddress = await zero.GetContractAddressByName.call(AElf.utils.sha256('AElf.ContractNames.Token'));
      const token = await aelf.chain.contractAt(tokenAddress);
      setContract(token);
    }
  }

  function disconnect() {
    aelf.disconnect().then(setResult).catch(setResult);
  }

  async function callMethod() {
    const res = await contract.GetBalance.call({
      owner: '2RCLmZQ2291xDwSbDEJR6nLhFJcMkyfrVTq1i1YxWC4SdY49a6',
      symbol: 'ELF'
    });
    setResult(res);
  }

  async function sendMethod() {
    const res = await contract.Transfer({
      symbol: 'ELF',
      amount: 1 * (10 ** 8),
      memo: 'yeah',
      to: '2RCLmZQ2291xDwSbDEJR6nLhFJcMkyfrVTq1i1YxWC4SdY49a6'
    });
    setResult(res);
  }
  return (
    <div className="dapp">
      <Button onClick={() => connect()}>connect</Button>
      <Button onClick={() => getAccountInfo()}>get account info</Button>
      <Button onClick={() => getChainStatus()}>get chain status</Button>
      <Button onClick={() => getChainHeight()}>get chain height</Button>
      <Button onClick={() => getNativeTokenInfo()}>get native token info</Button>
      <Button onClick={() => getContract()}>get token contract</Button>
      {contract ? <Button onClick={callMethod}>Get Balance</Button> : null}
      {contract ? <Button onClick={sendMethod}>Transfer 1 ELF</Button> : null}
      <Button onClick={() => disconnect()}>disconnect</Button>
      Result:
      <pre>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
};

export default React.memo(App);
