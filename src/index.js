import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
const routerBaseName = process.env.NODE_ENV === 'production' ? '/news' : undefined;
const oldCategoryRoute = window.location.hash.match(
  /^#\/(business|entertainment|general|health|science|sports|technology)\/?$/
);

if (oldCategoryRoute) {
  const prefix = process.env.NODE_ENV === 'production' ? '/news' : '';
  window.history.replaceState(null, '', `${prefix}/${oldCategoryRoute[1]}/`);
}

root.render(
  <React.StrictMode>
    <BrowserRouter basename={routerBaseName}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to measure performance, pass a function to reportWebVitals.
reportWebVitals();
