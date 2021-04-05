import React from 'react';

import styles from './Footer.module.css';

const Headline = () => (
  <footer className={styles.footer}>
    <p>
      <span>© 2011 - 2021. This app is open source. </span>
      <a
        href="https://github.com/aronwoost/google-calendar-hours"
        target="_blank"
        rel="noreferrer"
      >
        Check it on GitHub
      </a>
      <span>.</span>
    </p>
  </footer>
);

export default Headline;
