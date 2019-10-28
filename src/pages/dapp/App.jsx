/**
 * @file dapp app
 * @author atom-yang
 */
import React, { useEffect, useState } from 'react';
import { Button } from 'antd-mobile';
import AElfBridge from 'aelf-bridge';
import './index.less';

const App = () => {
  const [bridge, setBridge] = useState(null);
  const [result, setResult] = useState({});
  useEffect(() => {
    // use socket.io
    // const bridgeInstance = new AElfBridge({
    //   proxyType: 'SOCKET.IO'
    // });
    // use postMessage
    const bridgeInstance = new AElfBridge();
    setBridge(bridgeInstance);
  }, []);
  function connect() {
    bridge.connect().then(setResult).catch(setResult);
  }

  function getChainStatus() {
    bridge.api({
      apiPath: '/api/blockChain/chainStatus', // api路径
      arguments: []
    }).then(res => {
      setResult(res);
    }).catch(err => {
      console.log(err);
      setResult(err);
    });
  }

  function getChainHeight() {
    bridge.api({
      apiPath: '/api/blockChain/blockHeight', // api路径
      arguments: []
    }).then(setResult).catch(setResult);
  }

  function getNativeTokenInfo() {
    bridge.invokeRead({
      contractAddress: 'mS8xMLs9SuWdNECkrfQPF8SuRXRuQzitpjzghi3en39C3SRvf', // 合约地址
      contractMethod: 'GetNativeTokenInfo', // 合约方法名
      arguments: []
    }).then(setResult).catch(setResult);
  }

  function getAccountInfo() {
    bridge.account().then(setResult).catch(setResult);
  }

  function disconnect() {
    bridge.disconnect().then(setResult).catch(setResult);
  }

  return (
    <div className="dapp">
      <Button onClick={() => connect()}>connect</Button>
      <Button onClick={() => getAccountInfo()}>get account info</Button>
      <Button onClick={() => getChainStatus()}>get chain status</Button>
      <Button onClick={() => getChainHeight()}>get chain height</Button>
      <Button onClick={() => getNativeTokenInfo()}>get native token info</Button>
      <Button onClick={() => disconnect()}>disconnect</Button>
      <div>
        Result:
        {JSON.stringify(result, null, 2)}
      </div>
    </div>
  );
};

export default React.memo(App);
