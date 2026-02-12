export function post(url, params) {
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status == 0 || res.code == 200) resolve(res);
        else reject(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

export function get(url, params) {
  return new Promise((resolve, reject) => {
    const query = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    url = `${url}?${query}`;
    fetch(url, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status == 0 || res.code == 200) resolve(res);
        else reject(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

export function postData(url, params, headers) {
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(params),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code == 200 || res.code == 200) resolve(res);
        else reject(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

export function getData(url, params, headers) {
  return new Promise((resolve, reject) => {
    const query = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    url = `${url}?${query}`;
    fetch(url, {
      method: "GET",
      headers: {
        ...headers,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code == 200) resolve(res);
        else reject(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
}
