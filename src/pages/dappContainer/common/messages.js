/**
 * @file message related
 * @author atom-yang
 */
import * as elliptic from 'elliptic';
import AElf from 'aelf-sdk';
import {
  aelf,
  wallet,
  ACCOUNT_INFO,
  CHAIN_APIS,
  SUPPORTED_EC,
  END_POINT
} from './constants';
import {
  randomId,
  serializeMessage,
  sign,
  verify,
  checkTimestamp
} from './utils';

export const responseFormat = (id, result, errors) => {
  if (errors && (errors instanceof Error || (Array.isArray(errors) && errors.length > 0))) {
    return {
      id,
      result: {
        errors: Array.isArray(errors) ? errors : [errors],
        code: errors.code || 500,
        msg: errors.message || 'err happened',
        data: result
      }
    };
  }
  return {
    id,
    result: {
      code: 0,
      msg: 'success',
      errors: [],
      data: result
    }
  };
};

export function serializeResult(response, keyPair) {
  const originalResult = serializeMessage(response.result);
  const signature = sign(Buffer.from(originalResult, 'base64'), keyPair);
  return {
    id: response.id,
    result: {
      originalResult,
      signature
    }
  };
}

function handleConnect(keyPair) {
  const random = randomId();
  const signature = sign(random, keyPair);
  const publicKey = keyPair.getPublic().encode('hex');
  return {
    publicKey,
    signature,
    random
  };
}

async function handleInvoke(params, isReadOnly = false) {
  const {
    endpoint = END_POINT,
    contractAddress,
    contractMethod,
    arguments: contractArgs
  } = params;
  if (endpoint) {
    aelf.setProvider(new AElf.providers.HttpProvider(endpoint));
  }
  const contract = await aelf.chain.contractAt(contractAddress, wallet);
  if (!contract[contractMethod]) {
    throw new Error(`No such method ${contractMethod}`);
  }
  let result;
  if (isReadOnly) {
    result = await contract[contractMethod].call(...contractArgs.map(v => v.value));
  } else {
    result = await contract[contractMethod](...contractArgs.map(v => v.value));
  }
  return result;
}

function handleAccount() {
  return ACCOUNT_INFO;
}

async function handleApi(params) {
  const {
    endpoint = END_POINT,
    apiPath,
    arguments: apiArgs
  } = params;
  if (!CHAIN_APIS[apiPath]) {
    throw new Error(`Not support api ${apiPath}`);
  }
  if (endpoint) {
    aelf.setProvider(new AElf.providers.HttpProvider(endpoint));
  }
  const result = await aelf.chain[CHAIN_APIS[apiPath]](apiArgs.map(v => v.value));
  return result;
}

function handleRequestVerify(action, params, dappKeyPair) {
  const {
    signature
  } = params;
  if (action === 'connect') {
    return verify(Buffer.from(String(params.timestamp)), signature, dappKeyPair);
  }
  return verify(Buffer.from(params.originalParams, 'base64'), signature, dappKeyPair);
}

function deserializeRequestParams(action, params) {
  if (action === 'connect') {
    return {
      timestamp: params.timestamp,
      publicKey: params.publicKey
    };
  }
  let result = decodeURIComponent(atob(params.originalParams));
  try {
    result = JSON.parse(result);
  } catch (e) {
    result = {};
  }
  if (!checkTimestamp(result.timestamp)) {
    throw new Error('Timestamp is not valid');
  }
  return {
    ...result
  };
}


export const handleMessage = async (request, keyPair, dappKeyPair) => {
  const {
    id,
    action,
    params
  } = request;
  if (!handleRequestVerify(action, params, dappKeyPair)) {
    throw new Error('Received an invalid signature');
  }
  const realParams = deserializeRequestParams(action, params);
  let result = {};
  try {
    switch (action) {
      case 'connect':
        result = responseFormat(
          id,
          handleConnect(keyPair)
        );
        break;
      case 'invoke':
      case 'invokeRead':
        result = responseFormat(
          id,
          await handleInvoke(realParams, action === 'invokeRead')
        );
        break;
      case 'account':
        result = responseFormat(
          id,
          handleAccount()
        );
        break;
      case 'api':
        result = responseFormat(id, await handleApi(realParams));
        break;
      case 'disconnect':
        result = responseFormat(id, {});
        break;
      default:
        throw new Error(`Not implement this action ${action}`);
    }
    return result;
  } catch (e) {
    console.log(e);
    return responseFormat(id, {}, e);
  }
};

export const handleConnection = (request, keyPairs) => {
  const {
    timestamp,
    encryptAlgorithm,
    signature,
    publicKey
  } = request.params;
  if (!checkTimestamp(timestamp)) {
    throw new Error('Timestamp is not valid');
  }
  if (!SUPPORTED_EC.includes(encryptAlgorithm)) {
    throw new Error(`Not support ${encryptAlgorithm}`);
  }
  let keyPair;
  const ec = elliptic.ec(encryptAlgorithm);
  const dappKeyPair = ec.keyFromPublic(publicKey, 'hex');
  if (keyPairs[encryptAlgorithm]) {
    keyPair = keyPairs[encryptAlgorithm];
  } else {
    keyPair = ec.genKeyPair();
  }
  if (!verify(Buffer.from(String(timestamp)), signature, dappKeyPair)) {
    throw new Error('Received an invalid signature');
  }
  return {
    keyPair,
    dappKeyPair,
    encryptAlgorithm
  };
};
