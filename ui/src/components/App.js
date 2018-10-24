import React, { Component } from 'react';
import '../style/App.css';
import TextList from './TextList';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Commentaria Aristotelica</h1>
        </header>
        
        <TextList />
      </div>
    );
  }
}

export default App;
