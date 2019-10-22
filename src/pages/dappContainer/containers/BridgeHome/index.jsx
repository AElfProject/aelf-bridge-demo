/**
 * @file bridge home
 * @author atom-yang
 */
import React from 'react';
import PropTypes from 'prop-types';
import { bind } from 'lodash-decorators';
import {
  serializeMessage,
  deserializeMessage
} from '../../common/utils';
import {
  handleMessage,
  handleConnection,
  responseFormat,
  serializeResult
} from '../../common/messages';
import './index.less';

class BridgeHome extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    width: PropTypes.string,
    height: PropTypes.string
  };

  static defaultProps = {
    width: '100%',
    height: '100%'
  };

  iframe = null;

  keyPairs = {};

  dappKeyPairs = {};

  state = {
    currentAppId: null,
    currentEC: ''
  };

  componentDidMount() {
    const { id: iframeId } = this.props;
    document.querySelector(`#${iframeId}`).onload = () => {
      const {
        name: iframeName
      } = this.props;
      this.iframe = window.frames[iframeName];
      this.iframe.originalPostMessage = this.iframe.postMessage;
      this.iframe.postMessage = (...args) => {
        window.postMessage(...args);
      };
      window.addEventListener('message', this.handleMessageEvent);
    };
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleMessageEvent);
  }

  @bind
  async handleMessageEvent(event) {
    const message = deserializeMessage(event.data);
    console.log('receive message', message);
    if (!message) {
      return;
    }
    const { url } = this.props;
    const {
      currentAppId,
      currentEC
    } = this.state;
    let result = {};
    try {
      const { appId } = message;
      if (message.action === 'connect') {
        result = handleConnection(message, this.keyPairs);
        const {
          keyPair,
          dappKeyPair,
          encryptAlgorithm
        } = result;
        this.keyPairs = {
          ...this.keyPairs,
          [encryptAlgorithm]: keyPair
        };
        this.dappKeyPairs = {
          ...this.dappKeyPairs,
          [appId]: dappKeyPair
        };
        this.setState({
          currentAppId: appId,
          currentEC: encryptAlgorithm
        }, async () => {
          result = await handleMessage(message, keyPair, dappKeyPair);
          console.log(serializeMessage(result, keyPair));
          this.iframe.originalPostMessage(serializeMessage(result, keyPair), url.split('?')[0]);
        });
      } else {
        result = await handleMessage(message, this.keyPairs[currentEC], this.dappKeyPairs[currentAppId]);
        console.log('result', result);
        this.sendMessage(result, this.keyPairs[currentEC]);
      }
    } catch (e) {
      console.log(e);
      this.sendMessage(responseFormat(message.id, {}, e), this.keyPairs[currentEC]);
    }
  }

  sendMessage(message, keyPair) {
    const { url } = this.props;
    this.iframe.originalPostMessage(serializeMessage(serializeResult(message, keyPair)), url.split('?')[0]);
  }

  render() {
    const {
      name,
      url,
      id,
      title,
      height,
      width
    } = this.props;
    return (
      <div className="bridge-home">
        <iframe
          name={name}
          title={title}
          src={url}
          width={width}
          height={height}
          id={id}
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
        />
      </div>
    );
  }
}

export default BridgeHome;
