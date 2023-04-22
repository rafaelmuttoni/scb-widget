import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

function renderMyWidget(element) {
  ReactDOM.render(<App />, element);
}

(function() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  renderMyWidget(container);
})();
