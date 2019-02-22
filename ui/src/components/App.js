import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { Switch, Route } from 'react-router-dom'
import { Layout, Row, Col } from 'antd';
import AuthorList from './Authors/AuthorList';
import AuthorDetails from './Authors/AuthorDetails';
import Home from './Home';
import TextDetails from './Texts/TextDetails';
import TextList from './Texts/TextList';
import ManuscriptList from './Manuscripts/ManuscriptList';
import ManuscriptDetails from './Manuscripts/ManuscriptDetails';
import Login from './Login';
import { SideMenu } from './Menu';

const { Sider, Header, Content, Footer } = Layout;


const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_URI
})

function App(props) {

  const auth = props.auth

  return (
    <ApolloProvider client={client}>
      <Layout>
        <Header className="header">
          <img height="50px" alt="Aristotelica" src={require("../img/logo.png")} />
          <div className="title">
            <h1>Aristotelica</h1>
            <h2>Sources for the Aristotelian Tradition</h2>
          </div>

        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Layout>
            <Sider theme='light'>
              <SideMenu />
              <Login auth={auth} {...props} />
            </Sider>
            <Content>
              <div style={{ background: '#fff', padding: 12, minHeight: '100%' }}>
                <Switch>
                  <Route exact path="/" component={Home} />
                  <Route exact path="/texts" component={TextList} />
                  <Route exact path="/authors" component={AuthorList} />
                  <Route exact path="/author/:id" render={props => <AuthorDetails auth={auth} {...props} />} />
                  <Route exact path="/text/:id" component={TextDetails} />
                  <Route exact path="/manuscripts" component={ManuscriptList} />
                  <Route exact path="/manuscript/:id" render={props => <ManuscriptDetails auth={auth} {...props} />} />
                </Switch>
              </div>
            </Content>
          </Layout>
        </Content>
        <Footer className="footer">
          <Row>
            <Col span={12}>
              <p>
                © Michael Stenskjær Christensen 2019, MIT Licensed,
                <a href="https://github.com/stenskjaer/aristotelica">
                  <img className="github-logo" src={require('../img/octocat.png')} alt="Github" />
                  open source
                </a>
              </p>
            </Col>
            <Col span={12}>
              <p>
                <em>Aristotelica</em> is a part <a href="https://representationandreality.gu.se/">Representation and Reality</a>, funded by <a href="https://www.rj.se/en/">Riksbankens Jubileumsfond</a>
              </p>
            </Col>
          </Row>
        </Footer>
      </Layout>
    </ApolloProvider>
  );
}

export default App;
