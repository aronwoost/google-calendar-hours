import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { orderBy } from 'lodash';

import {
  selectSelectedCalendar,
  selectEventsByRange,
} from '../stores/viewState';

import styles from './Events.module.css';

const Events = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState('date');

  const selectedCalendar = useSelector(selectSelectedCalendar);
  const events = useSelector((state) =>
    selectEventsByRange(state, selectedCalendar)
  );

  if (!events) {
    return null;
  }

  let eventsToRender = events.map((event) => {
    const itemDateStart = new Date(event.start.dateTime);
    const itemDateEnd = new Date(event.end.dateTime);

    const hours = (itemDateEnd - itemDateStart) / 1000 / 60 / 60;

    return {
      ...event,
      hours,
    };
  });

  if (sortBy === 'amount') {
    eventsToRender = orderBy(eventsToRender, 'hours', 'desc');
  }

  return (
    <div>
      <div>
        <button type="button" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'hide details' : 'show details'}
        </button>
      </div>
      {isOpen && (
        <Fragment>
          <ul className={styles.list}>
            {eventsToRender.map((event) => (
              <li key={event.id} className={styles.listItem}>
                <span>{dayjs(event.start.dateTime).format('DD.MM.')}</span>
                <span>{event.summary}</span>
                <span>{`${event.hours}h`}</span>
              </li>
            ))}
          </ul>
          <div>
            <span>Sort by:</span>
            <label htmlFor="contactChoice2">
              Date
              <input
                type="radio"
                value="date"
                checked={sortBy === 'date'}
                onChange={({ target }) => setSortBy(target.value)}
              />
            </label>
            <label htmlFor="contactChoice1">
              Amount
              <input
                type="radio"
                value="amount"
                checked={sortBy === 'amount'}
                onChange={({ target }) => setSortBy(target.value)}
              />
            </label>
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default Events;
