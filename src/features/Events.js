import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import {
  selectSelectedCalendar,
  selectEventsByRange,
} from '../stores/viewState';

import styles from './Events.module.css';

const Events = () => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCalendar = useSelector(selectSelectedCalendar);
  const events = useSelector((state) =>
    selectEventsByRange(state, selectedCalendar)
  );

  if (!events) {
    return null;
  }

  return (
    <div>
      <div>
        <button type="button" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'hide details' : 'show details'}
        </button>
      </div>
      {isOpen && (
        <ul className={styles.list}>
          {events.map((event) => {
            const itemDateStart = new Date(event.start.dateTime);
            const itemDateEnd = new Date(event.end.dateTime);

            const hours = (itemDateEnd - itemDateStart) / 1000 / 60 / 60;

            return (
              <li key={event.id} className={styles.listItem}>
                <span>{dayjs(event.start.dateTime).format('DD.MM.')}</span>
                <span>{event.summary}</span>
                <span>{`${hours}h`}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Events;
