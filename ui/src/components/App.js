import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { Switch, Route } from 'react-router-dom'
import { Layout, Button } from 'antd';
import AuthorList from './Authors/AuthorList';
import EditAuthor from './Authors/EditAuthor';
import TextItem from './Texts/TextItem';
import EditText from './Texts/EditText';
import TextList from './Texts/TextList';
import { SideMenu, TopMenu } from './Menu';

const { Sider, Header } = Layout

const { Content } = Layout;


// class App extends Component {

//   auth = new Auth();

//   handleAuthentication = (nextState, replace) => {
//     if (/access_token|id_token|error/.test(nextState.location.hash)) {
//       this.auth.handleAuthentication();
//     }
//   }

//   login() {
//     this.auth.login();
//   }

//   logout() {
//     this.auth.logout();
//   }

//   componentDidMount() {
//     const { renewSession } = this.auth;

//     if (localStorage.getItem('isLoggedIn') === 'true') {
//       renewSession();
//     }
//   }


//   render() {

//     const { isAuthenticated } = this.auth;

//     return (
//       <Layout>
//         {
//           !isAuthenticated() && (
//             <Button
//               onClick={() => this.login()}
//             >
//               Log In
//             </Button>
//           )
//         }
//         {
//           isAuthenticated() && (
//             <Button
//               onClick={() => this.logout()}
//             >
//               Log Out
//             </Button>
//           )
//         }
//         <Header className="header">
//           <TopMenu />
//         </Header>
//         <Content style={{ padding: '0 50px' }}>
//           <Layout>
//             <Sider>
//               <SideMenu />
//             </Sider>
//             <Content>
//               <div style={{ background: '#fff', padding: 12, minHeight: 280 }}>
//                 <Route path="/callback" render={(props) => {
//                   this.handleAuthentication(props);
//                   return <Callback {...props} />
//                 }} />
//                 <Switch>
//                   <Route exact path="/texts" component={TextList} />
//                   <Route exact path="/authors" component={AuthorList} />
//                   <Route exact path="/author/:id" component={EditAuthor} />
//                   <Route exact path="/text/:id" component={TextItem} />
//                   <Route exact path="/text/edit/:id" component={EditText} />
//                 </Switch>
//               </div>
//             </Content>
//           </Layout>
//         </Content>

//       </Layout>
//     );
//   }
// }

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_URI
})

class App extends Component {

  login() {
    this.props.auth.login();
  }

  logout() {
    this.props.auth.logout();
  }

  componentDidMount() {
    const { renewSession } = this.props.auth;

    if (localStorage.getItem('isLoggedIn') === 'true') {
      console.log("renew!")
      renewSession();
    }
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    console.log(isAuthenticated())

    return (
      <ApolloProvider client={client}>
        <Layout>
          {
            !isAuthenticated() && (
              <Button
                onClick={this.login.bind(this)}
              >
                Log In
                  </Button>
            )
          }
          {
            isAuthenticated() && (
              <Button
                onClick={this.logout.bind(this)}
              >
                Log Out
                  </Button>
            )
          }
          <Header className="header">
            <TopMenu />
          </Header>
          <Content style={{ padding: '0 50px' }}>
            <Layout>
              <Sider>
                <SideMenu />
              </Sider>
              <Content>
                <div style={{ background: '#fff', padding: 12, minHeight: 280 }}>
                  <Switch>
                    <Route exact path="/texts" component={TextList} />
                    <Route exact path="/authors" component={AuthorList} />
                    <Route exact path="/author/:id" component={EditAuthor} />
                    <Route exact path="/text/:id" component={TextItem} />
                    <Route exact path="/text/edit/:id" component={EditText} />
                  </Switch>
                </div>
              </Content>
            </Layout>
          </Content>
        </Layout>
      </ApolloProvider>
    );
  }
}

export default App;
