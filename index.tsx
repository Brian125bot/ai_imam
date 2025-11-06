/**
 * @file This is the entry point of the React application.
 * It finds the root DOM element and renders the main <App /> component into it.
 * React.StrictMode is used to highlight potential problems in the application during development.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
