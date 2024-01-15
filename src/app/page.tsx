'use client';

import App from '../components/App.js';
import store from '../components/stores/index.js';
import { Provider } from 'react-redux';

import 'bootstrap/dist/css/bootstrap.css';
import '../components/index.css';

export default function Home() {
  return (
    <Provider store={store()}>
      <App />
    </Provider>
  );
}
