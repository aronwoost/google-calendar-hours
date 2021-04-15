import React from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import {
  selectDate,
  selectRangeType,
  selectLocaleForWeekStart,
} from '../stores/viewState';
import formatDate from '../utils/formatDate';
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
    range = formatDate(dayjs(date), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } else if (currentRangeType === RANGE_TYPE.WEEK) {
    const startOfWeek = formatDate(date.locale(localeForWeekStart).weekday(0));
    const start = formatDate(startOfWeek, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const end = formatDate(startOfWeek.add(1, 'week'), {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    range = `${start} - ${end}`;
  } else if (currentRangeType === RANGE_TYPE.MONTH) {
    range = formatDate(date, {
      month: 'long',
      year: 'numeric',
    });
  } else if (currentRangeType === RANGE_TYPE.YEAR) {
    range = formatDate(date, {
      year: 'numeric',
    });
  }

  return <div data-testid="RangeDisplay">{range}</div>;
};

export default RangeDisplay;
