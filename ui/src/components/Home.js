import React from 'react';
import { Row, Col } from 'antd';

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
          <img className="bordered" src={require('../img/physics_ms.jpg')} width="100%" />
        </Col>
      </Row>
      <Row>
        <Col>
          <section>
            <h1>Recently updated resources</h1>
          </section>
        </Col>
      </Row>
    </div>
  );
}

export default Home;
