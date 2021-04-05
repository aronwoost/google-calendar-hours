import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { decode } from 'qss';

import Headline from './Headline';
import Footer from './Footer';
import { selectHasToken } from './stores/authentication';

import AuthScreen from './AuthScreen';
import Interface from './Interface';

import styles from './App.module.css';

const App = () => {
  const hasToken = useSelector(selectHasToken);

  useEffect(() => {
    const hashParams = decode(window.location?.hash?.slice(1) ?? '');

    if (hashParams.access_token) {
      sessionStorage.setItem('accessToken', hashParams.access_token);
      window.location = '/';
    }
  }, []);

  return (
    <div className={styles.appWrapper}>
      <div className={styles.app}>
        <div className={styles.sticky}>
          <div className={styles.content}>
            <Headline />
            {!hasToken && <AuthScreen />}
            {hasToken && <Interface />}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default App;
