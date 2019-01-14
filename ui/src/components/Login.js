import React from 'react';

class Login extends React.Component {

  login(location) {
    this.props.auth.login(location);
  }

  logout(location) {
    this.props.auth.logout(location);
  }

  componentDidMount() {
    const { renewSession } = this.props.auth;

    if (localStorage.getItem('isLoggedIn') === 'true') {
      renewSession(this.props.location);
    }
  }

  render() {

    const { isAuthenticated } = this.props.auth

    return (
      <div className="login">
        {
          !isAuthenticated() && (
            <div
              onClick={() => this.login(this.props.location)}
            >
              Log In
              </div>
          )
        }
        {
          isAuthenticated() && (
            <div
              onClick={() => this.logout(this.props.location)}
            >
              Log Out
              </div>
          )
        }
      </div>
    )
  }
}

export default Login;