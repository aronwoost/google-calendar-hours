import React from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import {
  selectDate,
  selectRangeType,
  selectLocaleForWeekStart,
} from '../stores/viewState';
import { RANGE_TYPE } from '../constants';

const RangeDisplay = () => {
  const currentDate = useSelector(selectDate);
  const currentRangeType = useSelector(selectRangeType);
  const localeForWeekStart = useSelector(selectLocaleForWeekStart);

  if (currentRangeType === RANGE_TYPE.TOTAL) {
    return null;
  }

  let range;
  const date = dayjs(currentDate);

  if (currentRangeType === RANGE_TYPE.DAY) {
    range = new Intl.DateTimeFormat([navigator.language, 'en-US'], {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } else if (currentRangeType === RANGE_TYPE.WEEK) {
    const startOfWeek = date.locale(localeForWeekStart).weekday(0);
    const nextWeek = startOfWeek.add(1, 'week');
    range = `${new Intl.DateTimeFormat([navigator.language, 'en-US'], {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(startOfWeek)} - ${new Intl.DateTimeFormat(
      [navigator.language, 'en-US'],
      {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      }
    ).format(nextWeek)}`;
  } else if (currentRangeType === RANGE_TYPE.MONTH) {
    range = new Intl.DateTimeFormat([navigator.language, 'en-US'], {
      month: 'long',
      year: 'numeric',
    }).format(date);
  } else if (currentRangeType === RANGE_TYPE.YEAR) {
    range = new Intl.DateTimeFormat([navigator.language, 'en-US'], {
      year: 'numeric',
    }).format(date);
  }

  return <div data-testid="RangeDisplay">{range}</div>;
};

export default RangeDisplay;
