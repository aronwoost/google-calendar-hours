import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import CalendarsList from './features/CalendarsList';
import Range from './features/Range';
import RangeChanger from './features/RangeChanger';
import Hours from './features/Hours';
import RangeDisplay from './features/RangeDisplay';
import { selectHasToken } from './stores/authentication';
import logo from './google_auth.png';

import styles from './App.module.css';

const getURLParameter = (name, searchOrHash) =>
  decodeURI(
    (RegExp(`${name}=(.+?)(&|$)`).exec(searchOrHash) || [null, null])[1]
  );

const App = () => {
  const hasToken = useSelector(selectHasToken);

  useEffect(() => {
    const accessToken = getURLParameter(
      'access_token',
      window.location && window.location.hash
    );
    if (accessToken !== 'null') {
      localStorage.setItem('accessToken', accessToken);
      window.location = '/';
    }
  }, []);

  const handleGoogleClick = () => {
    const clientId = '502172359025.apps.googleusercontent.com';
    const callbackUrl = `${window.location.origin}${window.location.pathname}auth.html`;
    const scope =
      'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly';
    const reqUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=${scope}&response_type=token`;

    window.location = reqUrl;
  };

  if (!hasToken) {
    return (
      <div>
        <button type="button" onClick={handleGoogleClick}>
          <img src={logo} alt="Auth with Google" width="191" height="46" />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <CalendarsList />
        <Range />
        <RangeChanger />
        <Hours />
        <RangeDisplay />
      </header>
    </div>
  );
};

export default App;
