import React from 'react';
import queryString from 'query-string';
import BridgeHome from './containers/BridgeHome';
import './index.less';

const App = () => {
  const {
    dappUrl = 'http://0.0.0.0:9527/dapp.html'
  } = queryString.parse(window.location.search);
  return (
    <div className="dapp-container">
      <BridgeHome
        name="dapp"
        id="dapp"
        title="Dapp demo"
        url={dappUrl}
      />
    </div>
  );
};

export default React.memo(App);
