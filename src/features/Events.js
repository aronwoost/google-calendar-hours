import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { orderBy } from 'lodash';

import {
  selectSelectedCalendar,
  selectEventsByRange,
  selectDate,
} from '../stores/viewState';
import { selectCalendars } from '../stores/calendars';
import createBlobUrl from '../utils/createBlobUrl';

import styles from './Events.module.css';

const Events = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState('date');

  const selectedCalendar = useSelector(selectSelectedCalendar);
  const events = useSelector((state) =>
    selectEventsByRange(state, selectedCalendar)
  );
  const calendars = useSelector(selectCalendars);
  const date = useSelector(selectDate);

  if (!events) {
    return null;
  }

  const currentCalendarName = calendars.find(
    (item) => item.id === selectedCalendar
  )?.label;

  let eventsToRender = events.map((event) => {
    const itemDateStart = new Date(event.start.dateTime);
    const itemDateEnd = new Date(event.end.dateTime);

    const hours = (itemDateEnd - itemDateStart) / 1000 / 60 / 60;

    return {
      ...event,
      hours,
    };
  });

  let downloadBlob;

  if (sortBy === 'amount') {
    const eventsObject = {};
    eventsToRender.forEach((event) => {
      if (eventsObject[event.summary]) {
        eventsObject[event.summary] += event.hours;
      } else {
        eventsObject[event.summary] = event.hours;
      }
    });
    const newArray = Object.entries(eventsObject).map(([key, value]) => ({
      summary: key,
      hours: value,
      id: key,
    }));
    eventsToRender = orderBy(newArray, 'hours', 'desc');
  } else {
    const lines = eventsToRender.map(
      (event) =>
        `${dayjs(event.start.dateTime).format('DD.MM.YYYY HH:mm')},${dayjs(
          event.end.dateTime
        ).format('DD.MM.YYYY HH:mm')},"${event.summary}",${event.hours}`
    );

    downloadBlob = createBlobUrl(
      ['Start,End,Title,Hours'].concat(lines).join('\n')
    );
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
                {sortBy === 'date' && (
                  <span>{dayjs(event.start.dateTime).format('DD.MM.')}</span>
                )}
                <span>{event.summary}</span>
                <span>{`${event.hours}h`}</span>
              </li>
            ))}
          </ul>
          {downloadBlob && (
            <a
              href={downloadBlob}
              download={`${currentCalendarName}_${dayjs(date).format(
                'MMMM_YYYY'
              )}_(${dayjs().format('YYYYMMDDHHmmss')}).csv`}
            >
              Export as CSV
            </a>
          )}
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
