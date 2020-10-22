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
import { SORT_BY } from '../constants';

import styles from './Events.module.css';

const Events = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState(SORT_BY.DATE);

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
  let filename;

  if (sortBy === SORT_BY.AMOUNT) {
    const eventsObject = {};
    eventsToRender.forEach(({ summary, hours }) => {
      if (eventsObject[summary]) {
        eventsObject[summary] += hours;
      } else {
        eventsObject[summary] = hours;
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
      ({ start, end, summary, hours }) =>
        `${dayjs(start.dateTime).format('DD.MM.YYYY HH:mm')},${dayjs(
          end.dateTime
        ).format('DD.MM.YYYY HH:mm')},"${summary}",${hours}`
    );

    downloadBlob = createBlobUrl(
      ['Start,End,Title,Hours'].concat(lines).join('\n')
    );
    filename = `${currentCalendarName}_${dayjs(date)
      .locale('en')
      .format('MMMM_YYYY')}_(${dayjs().format('YYYYMMDDHHmmss')}).csv`;
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
                {sortBy === SORT_BY.DATE && (
                  <span>{dayjs(event.start.dateTime).format('DD.MM.')}</span>
                )}
                <span>{event.summary}</span>
                <span>{`${event.hours}h`}</span>
              </li>
            ))}
          </ul>
          {downloadBlob && (
            <a href={downloadBlob} download={filename}>
              Export as CSV
            </a>
          )}
          <div>
            <span>Sort by:</span>
            <label htmlFor="date">
              Date
              <input
                type="radio"
                value="date"
                id="date"
                checked={sortBy === SORT_BY.DATE}
                onChange={({ target }) => setSortBy(target.value)}
              />
            </label>
            <label htmlFor="amount">
              Amount
              <input
                type="radio"
                value="amount"
                id="amount"
                checked={sortBy === SORT_BY.AMOUNT}
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
