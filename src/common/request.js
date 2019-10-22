/**
 * @file 请求方法
 * @author atom-yang
 */
import axios from 'axios';
import cookie from 'cookie';
import { omitBy } from 'lodash/fp';
import { isObject } from 'lodash';
import { API_PATH } from './constants';

const defaultRequestOptions = {
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
  withCredentials: true,
  method: 'POST'
};

const http = axios.create(defaultRequestOptions);

const needPurify = rawData => (isObject(rawData) && !Array.isArray(rawData));
const purify = rawData => (needPurify(rawData)
  ? omitBy(value => value === null
    || value === undefined
    || value === '')(rawData)
  : rawData);

/**
 * @desc 处理xhr status 200,但是数据status不为200的情况
 * @param response
 */
const handleInvalidError = ({ data }) => {
  // 处理response数据的errno
  if (+data.code === 0) {
    return data;
  }
  throw new Error(data);
  // todo: err handle
};

/**
 * @desc 处理xhr status不为200的情况
 * @param {Error} error 错误信息
 */
const handleRequestError = error => {
  // todo: 处理错误情况
  throw error;
};

async function getCsrfToken() {
  const cookies = cookie.parse(document.cookie);
  if ((cookies.csrfToken && cookies.csrfToken.length > 0) || process.env.NODE_ENV !== 'production') {
    return cookies.csrfToken;
  }
  await axios.get(API_PATH.INIT_CSRF_TOKEN);
  const token = await getCsrfToken();
  return token;
}

const makeRequestConfig = async (url, params, { headers = {}, ...extraOptions }) => {
  const data = purify(params);
  const config = {
    ...defaultRequestOptions,
    headers,
    url,
    ...extraOptions
  };

  if (config.method.toUpperCase() === 'GET') {
    config.params = data;
  } else if (config.method.toUpperCase() === 'POST') {
    const csrfToken = await getCsrfToken();
    config.headers = {
      ...headers,
      'x-csrf-token': csrfToken
    };
    config.data = data;
  } else {
    throw new Error(`don\'t support http method ${config.method.toUpperCase()}`);
  }

  return config;
};

/**
 * @param {string} url 地址
 * @param {Object} params 参数
 * @param {Object} extraOptions 额外的参数
 */
export const request = async (url, params, extraOptions = {}) => {
  const config = await makeRequestConfig(url, params, extraOptions);
  return http.request(config).then(res => handleInvalidError(res), handleRequestError);
};
