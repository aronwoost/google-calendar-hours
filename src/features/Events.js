import React, { Suspense, useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import bootstrap from 'bootstrap/dist/css/bootstrap.css';

import { selectHours } from '../stores/viewState';

import EventsList from './EventsListLazy';

const Events = () => {
  const [isOpen, setIsOpen] = useState(false);

  const rangeHours = useSelector(selectHours);

  if (!rangeHours) {
    return null;
  }

  return (
    <div>
      <div>
        <button
          type="button"
          className={cx(
            bootstrap.btn,
            bootstrap['btn-outline-secondary'],
            bootstrap['btn-sm']
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'hide details' : 'show details'}
        </button>
      </div>
      {isOpen && (
        <Suspense fallback={() => null}>
          <EventsList />
        </Suspense>
      )}
    </div>
  );
};

export default Events;
