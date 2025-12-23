import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthorizeCallback } from './pages/AuthorizeCallback';
import './index.css';

const isOAuthCallback = window.location.pathname === '/authorize';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{isOAuthCallback ? <AuthorizeCallback /> : <App />}</React.StrictMode>
);

