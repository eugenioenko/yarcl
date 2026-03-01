import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'virtual:yarcl-theme';
import 'yarcl/styles';
import './index.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
