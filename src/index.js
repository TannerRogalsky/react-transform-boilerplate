import React from 'react';
import {render} from 'react-dom';
import {Router, Route} from 'react-router';
import App from './views/App';

render((
  <Router>
    <Route path='/' component={App} />
  </Router>
), document.getElementById('root'))
