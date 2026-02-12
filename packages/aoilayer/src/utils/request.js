/**
 * POST请求
 * @param {String} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} headers - 请求头
 * @returns {Promise<Object>} 响应数据
 */
export function post(url, data, headers = {}) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

/**
 * POST请求（带数据）
 * @param {String} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} headers - 请求头
 * @returns {Promise<Object>} 响应数据
 */
export function postData(url, data, headers = {}) {
  return post(url, data, headers);
}

/**
 * GET请求
 * @param {String} url - 请求URL
 * @param {Object} params - 查询参数
 * @param {Object} headers - 请求头
 * @returns {Promise<Object>} 响应数据
 */
export function getData(url, params = {}, headers = {}) {
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  return fetch(fullUrl, {
    method: 'GET',
    headers
  }).then(res => res.json());
}
