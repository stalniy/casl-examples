export default function http(url, { headers, data, ...options } = {}) {
  if (data) {
    options.body = JSON.stringify(data)
  }

  const requestHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers
  }

  if (http.token) {
    requestHeaders.Authorization = http.token
  }

  return fetch(`${process.env.VUE_APP_API_URL}${url}`, {
    headers: requestHeaders,
    ...options
  }).then(response => {
    return response.json().then(body => ({
      body,
      status: response.status
    }))
  }).then(response => {
    if (response.status >= 200 && response.status < 300) {
      return response
    }

    if (!http.onError(response)) {
      throw new Error(response.body.message || response.body.errors.join('\n'))
    }
  })
}

http.onError = () => {}
