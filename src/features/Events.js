import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import cx from 'classnames';
import bootstrap from 'bootstrap/dist/css/bootstrap.css';

import {
  selectHours,
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

  const rangeHours = useSelector(selectHours);

  if (!rangeHours) {
    return null;
  }

  const currentCalendarName = calendars.find(
    (item) => item.id === selectedCalendar
  )?.label;

  let eventsToRender = events.map((event) => {
    const itemDateStart = new Date(event.start.dateTime);
    const itemDateEnd = new Date(event.end.dateTime);

    const hours =
      Math.round(((itemDateEnd - itemDateStart) / 1000 / 60 / 60) * 100) / 100;

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
    eventsToRender = newArray.sort(({ hours: hoursA }, { hours: hoursB }) => {
      if (hoursA > hoursB) {
        return -1;
      }
      if (hoursA < hoursB) {
        return 1;
      }

      return 0;
    });
  } else {
    const lines = eventsToRender.map(
      ({ start, end, summary, hours }) =>
        `${dayjs(start.dateTime).toJSON()},${dayjs(
          end.dateTime
        ).toJSON()},"${summary}",${hours}`
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
        <Fragment>
          <ul className={styles.list}>
            {eventsToRender.map((event) => (
              <li key={event.id} className={cx(bootstrap.row, styles.listItem)}>
                {sortBy === SORT_BY.DATE && (
                  <span className={cx(styles.eventDate, bootstrap['col-sm'])}>
                    {dayjs(event.start.dateTime).format('DD.MM.')}
                  </span>
                )}
                <span
                  className={cx(bootstrap['col-sm'], styles.eventName)}
                  title={event.summary}
                >
                  {event.summary}
                </span>
                <span
                  className={cx(bootstrap['col-sm'], styles.eventHours)}
                >{`${event.hours}h`}</span>
              </li>
            ))}
          </ul>
          <div>
            <span className={styles.sortByLabel}>Sort by:</span>
            <div
              className={cx(bootstrap['btn-group'], bootstrap['btn-group-sm'])}
              role="group"
            >
              <input
                className={bootstrap['btn-check']}
                type="radio"
                value="date"
                id="date"
                checked={sortBy === SORT_BY.DATE}
                onChange={({ target }) => setSortBy(target.value)}
              />
              <label
                className={cx(
                  bootstrap.btn,
                  bootstrap['btn-outline-secondary']
                )}
                htmlFor="date"
              >
                Date
              </label>
              <input
                className={bootstrap['btn-check']}
                type="radio"
                value="amount"
                id="amount"
                checked={sortBy === SORT_BY.AMOUNT}
                onChange={({ target }) => setSortBy(target.value)}
              />
              <label
                className={cx(
                  bootstrap.btn,
                  bootstrap['btn-outline-secondary']
                )}
                htmlFor="amount"
              >
                Amount
              </label>
            </div>
            {downloadBlob && (
              <a
                href={downloadBlob}
                download={filename}
                className={cx(
                  styles.downloadLink,
                  bootstrap.btn,
                  bootstrap['btn-outline-secondary'],
                  bootstrap['btn-sm']
                )}
              >
                Export as CSV
              </a>
            )}
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default Events;
