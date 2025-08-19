const BASE_URL = "http://192.168.1.34:5000/api";

async function request(method, endpoint, data = null, token = null) {
  const options = { method, headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token } };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

export const api = {
  get: (endpoint, data, token) => request("GET", endpoint, null, token),
  post: (endpoint, data, token) => request("POST", endpoint, data, token),
  put: (endpoint, data) => request("PUT", endpoint, data),
  del: (endpoint) => request("DELETE", endpoint),
};