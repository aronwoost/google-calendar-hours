import React from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import {
  selectDate,
  selectRangeType,
  selectLocaleForWeekStart,
  selectSelectedCalendar,
} from '../stores/viewState';
import { RANGE_TYPE } from '../constants';

const RangeDisplay = () => {
  const currentDate = useSelector(selectDate);
  const currentRangeType = useSelector(selectRangeType);
  const localeForWeekStart = useSelector(selectLocaleForWeekStart);
  const selectedCalendar = useSelector(selectSelectedCalendar);

  if (currentRangeType === RANGE_TYPE.TOTAL || !selectedCalendar) {
    return null;
  }

  let range;
  const date = dayjs(currentDate);

  if (currentRangeType === RANGE_TYPE.DAY) {
    range = date.locale('en').format('dddd, MMMM D, YYYY');
  } else if (currentRangeType === RANGE_TYPE.WEEK) {
    const startOfWeek = date.locale(localeForWeekStart).weekday(0);
    const nextWeek = startOfWeek.add(1, 'week');
    range = `${startOfWeek
      .locale('en')
      .format('DD.MM.YYYY')} -  ${nextWeek.locale('en').format('DD.MM.YYYY')}`;
  } else if (currentRangeType === RANGE_TYPE.MONTH) {
    range = date.locale('en').format('MMMM, YYYY');
  } else if (currentRangeType === RANGE_TYPE.YEAR) {
    range = date.locale('en').format('YYYY');
  }

  return <div data-testid="RangeDisplay">{range}</div>;
};

export default RangeDisplay;
