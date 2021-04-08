import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { orderBy } from 'lodash';
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

import styles from './EventsList.module.css';

const EXPORT_DATE_FORMAT = 'DD.MM.YYYY HH:mm';

const Events = () => {
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
        `${dayjs(start.dateTime).format(EXPORT_DATE_FORMAT)},${dayjs(
          end.dateTime
        ).format(EXPORT_DATE_FORMAT)},"${summary}",${hours}`
    );

    downloadBlob = createBlobUrl(
      ['Start,End,Title,Hours'].concat(lines).join('\n')
    );
    filename = `${currentCalendarName}_${dayjs(date)
      .locale('en')
      .format('MMMM_YYYY')}_(${dayjs().format('YYYYMMDDHHmmss')}).csv`;
  }

  return (
    <Fragment>
      <ul className={styles.list}>
        {eventsToRender.map((event) => (
          <li key={event.id} className={bootstrap.row}>
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
            className={cx(bootstrap.btn, bootstrap['btn-outline-secondary'])}
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
            className={cx(bootstrap.btn, bootstrap['btn-outline-secondary'])}
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
  );
};

export default Events;
