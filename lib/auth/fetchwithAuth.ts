export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
) {
  let token =
    localStorage.getItem('token');

  let response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    const refreshToken =
      localStorage.getItem(
        'refreshToken'
      );

    const refreshResponse =
      await fetch('/api/refresh', {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

    if (!refreshResponse.ok) {
      localStorage.clear();
      window.location.href = '/';
      throw new Error(
        'SESSION_EXPIRED'
      );
    }

    const refreshData =
      await refreshResponse.json();

    localStorage.setItem(
      'token',
      refreshData.accessToken
    );

    token = refreshData.accessToken;

    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return response;
}