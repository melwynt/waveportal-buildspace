import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const el = document.getElementById('root');
Modal.setAppElement(el);

ReactDOM.render(<App />, el);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
