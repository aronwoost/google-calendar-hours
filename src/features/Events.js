import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import cx from 'classnames';
import bootstrap from 'bootstrap/dist/css/bootstrap.css';

import {
  selectSelectedCalendar,
  selectEventsByRange,
  selectDate,
} from '../stores/viewState';
import { selectCalendars } from '../stores/calendars';
import createBlobUrl from '../utils/createBlobUrl';
import formatDate from '../utils/formatDate';
import roundHours from '../utils/roundHours';
import { SORT_BY } from '../constants';

import styles from './Events.module.css';

const EXPORT_DATE_FORMAT = 'DD.MM.YYYY HH:mm';

const sortByHours = ({ hours: hoursA }, { hours: hoursB }) => {
  if (hoursA > hoursB) {
    return -1;
  }
  if (hoursA < hoursB) {
    return 1;
  }

  return 0;
};

const sortByStart = ({ start: startA }, { start: startB }) => {
  if (startA < startB) {
    return -1;
  }
  if (startA > startB) {
    return 1;
  }

  return 0;
};

const format = (date) => dayjs(date).format(EXPORT_DATE_FORMAT);

const Events = () => {
  const [sortBy, setSortBy] = useState(SORT_BY.DATE);

  const selectedCalendar = useSelector(selectSelectedCalendar);
  const events = useSelector(selectEventsByRange);
  const calendars = useSelector(selectCalendars);
  const date = useSelector(selectDate);

  const currentCalendarName = calendars.find(
    (item) => item.id === selectedCalendar
  )?.label;

  let eventsToRender = events.map((event) => ({
    ...event,
    hours: (new Date(event.end) - new Date(event.start)) / 1000 / 60 / 60,
  }));

  let downloadBlob;
  let filename;

  if (sortBy === SORT_BY.AMOUNT) {
    const eventsObject = eventsToRender.reduce((acc, { summary, hours }) => {
      acc[summary] = acc[summary] ? (acc[summary] += hours) : hours;
      return acc;
    }, {});
    eventsToRender = Object.entries(eventsObject)
      .map(([key, value]) => ({ summary: key, hours: value, id: key }))
      .sort(sortByHours);
  } else {
    eventsToRender = eventsToRender.sort(sortByStart);

    const lines = eventsToRender.map(
      ({ start, end, summary, hours }) =>
        `${format(start)},${format(end)},"${summary}",${roundHours(hours)}`
    );

    downloadBlob = createBlobUrl(
      ['Start,End,Title,Hours'].concat(lines).join('\n')
    );
    filename = `${currentCalendarName}_${dayjs(date)
      .locale('en')
      .format('MMMM_YYYY')}_(${dayjs().format('YYYYMMDDHHmmss')}).csv`;

    console.log(eventsToRender)
  }

  return (
    <div>
      <ul className={styles.list}>
        {eventsToRender.map(({ id, start, end, summary, hours }) => (
          <li key={id} className={cx(bootstrap.row, styles.listItem)}>
            {sortBy === SORT_BY.DATE && (
              <span
                className={cx(styles.eventDate, bootstrap['col-sm'])}
                title={formatDate(dayjs(start), {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              >
                {formatDate(dayjs(start), {
                  day: '2-digit',
                  month: '2-digit',
                })}
              </span>
            )}
            <span
              className={cx(bootstrap['col-sm'], styles.eventName)}
              title={summary}
            >
              {summary}
            </span>
            <span
              className={cx(bootstrap['col-md'], styles.eventName)}
              title='Starttime'
            >
              {`${new Date(start).getHours()}:${new Date(start).getMinutes()} - ${new Date(end).getHours()}:${new Date(end).getMinutes()} `}
            </span>
            <span
              className={cx(bootstrap['col-sm'], styles.eventHours)}
            >{`${roundHours(hours)}h`}</span>
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
    </div>
  );
};

export default Events;
