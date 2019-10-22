/**
 * @file utils
 * @author atom-yang
 */
import queryString from 'query-string';
import uuid from 'uuid/v4';
import {
  MESSAGE_PREFIX
} from './constants';

export const randomId = () => uuid().replace(/-/g, '');

export const isValidHexString = str => /^(0x)?[0-9a-fA-F]+$/.test(str);

export const serializeMessage = data => {
  let result = JSON.stringify(data);
  if (data === null || data === undefined) {
    result = '';
  }
  return btoa(encodeURIComponent(result));
};

export const deserializeMessage = str => {
  const strs = str.split('?');
  if (str.length > 0 && strs.length === 2 && str.startsWith(MESSAGE_PREFIX)) {
    let result = queryString.parse(strs[1]).params || '';
    result = decodeURIComponent(atob(result));
    try {
      result = JSON.parse(result);
    } catch (e) {}
    return result;
  }
  return false;
};

/**
 * sign message with keyPair
 * @param {string|Buffer|Uint8Array} msg hex string or Buffer array
 * @param {Object} keyPair ecc keyPair
 * @return {string}
 */
export const sign = (msg, keyPair) => {
  const signedMsg = keyPair.sign(msg);
  return [
    signedMsg.r.toString(16, 64),
    signedMsg.s.toString(16, 64),
    `0${signedMsg.recoveryParam.toString()}`
  ].join('');
};

/**
 * verify signature
 * @param {string|Buffer|Uint8Array} msg hex string or buffer array
 * @param {string} signature hex string
 * @param {Object} keyPair ecc keyPair
 * @return {boolean|Object}
 */
export const verify = (msg, signature, keyPair) => {
  const r = signature.slice(0, 64);
  const s = signature.slice(64, 128);
  const recoveryParam = signature.slice(128);
  const signatureObj = {
    r,
    s,
    recoveryParam
  };
  try {
    const result = keyPair.verify(msg, signatureObj);
    return result;
  } catch (e) {
    return false;
  }
};

export const dispatchMessage = (message, eventId = '') => {
  let event;
  try {
    event = new MessageEvent('message', {
      data: message,
      origin: window.location.origin,
      lastEventId: eventId
    });
  } catch (e) {
    event = document.createEvent('MessageEvent');
    event.initMessageEvent(
      'message',
      true,
      true,
      message,
      window.location.origin,
      eventId
    );
  }
};
