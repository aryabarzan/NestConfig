const checkAuth = async () => {
  try {
    const response = await fetch(`${window.baseUrl}${window.path}/auth/check`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.loggedIn) {
        signIn();
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        if (email) {
          const emailElement = document.getElementById('email');
          emailElement.textContent += email;
        }
      }
    } else {
      signIn();
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    signIn();
  }
};

const signIn = async () => {
  const clientId = await axios
    .get(`${window.baseUrl}${window.path}/auth/client-id`, {
      maxRedirects: 5, // Allow up to 5 redirects
    })
    .then((response) => response.data);
  const redirectUri = `${window.baseUrl}${window.path}/auth/callback`;
  const tenantId = 'organizations';

  // Store the original URL in a query parameter
  const originalUrl = window.location.href;
  const state = encodeURIComponent(JSON.stringify({ originalUrl }));

  // Include the state parameter in the auth URL
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=openid%20profile%20email%20User.Read&state=${state}`;
  window.location.href = authUrl;
};
// Check authentication status when the page loads
checkAuth();
