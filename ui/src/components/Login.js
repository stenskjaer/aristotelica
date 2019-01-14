import React from 'react';

class Login extends React.Component {

  login() {
    this.props.auth.login();
  }

  logout() {
    this.props.auth.logout();
  }

  componentDidMount() {
    const { renewSession } = this.props.auth;

    if (localStorage.getItem('isLoggedIn') === 'true') {
      renewSession();
    }
  }

  render() {

    const { isAuthenticated } = this.props.auth

    return (
      <div className="login">
        {
          !isAuthenticated() && (
            <div
              onClick={this.login.bind(this)}
            >
              Log In
              </div>
          )
        }
        {
          isAuthenticated() && (
            <div
              onClick={this.logout.bind(this)}
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