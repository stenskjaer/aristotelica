import React from 'react';
import { Row, Col, Card } from 'antd';

function Home() {

  return (
    <div className="home-container">
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col span={12}>
          <section>
            <p className="lead">
              <em>Aristotelica</em> is a modern, open and extensible database of the sources to the Aristotelian Tradition.
            </p>
            <p>
              Modern data models makes it possible to register, analyze and browse the sources in flexible ways the represent the nature of the material more directly.
            </p>
            <p>
              The system implements an open contribution model where scholars within different areas of the Aristotelian tradition can extend and improve the registred data.
            </p>
            <p>
              There already exists big amounts of data on on the Aristotelian tradition in other online archives. <em>Aristotelica</em> will enable import systems for collecting these dispersed sources into a coherent picture.
            </p>
          </section>
        </Col>
        <Col span={12}>
          <img className="bordered" alt="Latin manuscript for Aristotle's Physics" src={require('../img/physics_ms.jpg')} width="100%" />
        </Col>
      </Row>
      <Row>
        <Col>
          <section>
            <h1>Recently updated resources</h1>
          </section>
        </Col>
      </Row>

      <section>
        <h1>About</h1>
        <p>
          The <em>Aristotelica</em> project is started by Michael Stenskjær Christensen as a framework the sources on Aristotle's <em>De anima</em> collected from existing catalogues for his PhD dissertation. This is reflected in the content of the database, as it currently almost only contains sources on <em>De anima</em>. But it is designed to be able to contain any sources from the Aristotelian Tradition.
        </p>
        <Row gutter={8}>
          <Col span={8}>
            <Card title="Context">
              <img style={{ float: 'left', paddingRight: '10px' }} width="100px" height="65px" alt="R&R" src={require('../img/rr_logo.jpeg')} />
              The website is part of the project <a href="https://representationandreality.gu.se/">Representation and Reality: Historical and Contemporary Perspectives on the Aristotelian Tradition</a>. The project is hosted at <a href="https://www.gu.se/">University of Gothenburg</a>.
          </Card>
          </Col>
          <Col span={8}>
            <Card title="Funding"
              cover={<img alt="Riksbankens Jubileumsfond" src={require('../img/rj_logo.png')} />}
            >
              <a href="https://www.rj.se/en/">Riksbankens Jubileumsfond</a> has provided the overall funding of the project.
          </Card>
          </Col>
        </Row>
      </section>

    </div>
  );
}

export default Home;
