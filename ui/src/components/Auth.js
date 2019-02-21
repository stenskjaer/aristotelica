import auth0 from 'auth0-js';
import history from '../utils/history';

export function createNonce(length) {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~'
  let result = ''
  for (var i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

export default class Auth {
  accessToken;
  idToken;
  expiresAt;

  auth0 = new auth0.WebAuth({
    domain: 'aristotelica.eu.auth0.com',
    clientID: '5mXVeIC4qg488et2TLLMjj8gHld0kbmT',
    redirectUri: 'http://localhost:3000/callback',
    responseType: 'token id_token',
    scope: 'openid'
  });

  handleAuthentication = () => {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        history.replace('/');
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    })
  }

  getAccessToken = () => {
    return this.accessToken;
  }

  getIdToken = () => {
    return this.idToken;
  }

  storeLocation = (state) => {
    const nonce = createNonce(12)
    const location = { [nonce]: state.pathname }
    localStorage.setItem('location', JSON.stringify(location))
    return nonce
  }

  matchStoredLocation = (nonce) => {
    const location = JSON.parse(localStorage.getItem('location'))
    return location[nonce] || null
  }

  login = (locationParams) => {
    const nonce = this.storeLocation(locationParams)
    this.auth0.authorize({ state: nonce });
  }

  setSession(authResult) {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');

    // Set the time that the access token will expire at
    let expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.expiresAt = expiresAt;

    const storedLocation = this.matchStoredLocation(authResult.state)
    if (storedLocation) {
      history.replace(storedLocation);
    } else {
      history.replace('/');
    }
  }

  renewSession = (location) => {
    const nonce = this.storeLocation(location)
    this.auth0.checkSession({ state: nonce }, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        this.logout();
        console.log(err);
        alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
      }
    });
  }

  logout = (location) => {
    // Remove tokens and expiry time
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('location');
    history.replace(location);
  }

  isAuthenticated = () => {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = this.expiresAt;
    return new Date().getTime() < expiresAt;
  }
}