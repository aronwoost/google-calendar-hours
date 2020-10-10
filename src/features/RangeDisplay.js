import React from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { selectDate, selectRangeType } from '../stores/viewState';
import { RANGE_TYPE } from '../constants';

const RangeDisplay = () => {
  const currentDate = useSelector(selectDate);
  const currentRangeType = useSelector(selectRangeType);

  if (currentRangeType === RANGE_TYPE.TOTAL) {
    return null;
  }

  let range;
  const date = dayjs(currentDate);

  if (currentRangeType === RANGE_TYPE.DAY) {
    range = date.format('dddd, MMMM D, YYYY');
  } else if (currentRangeType === RANGE_TYPE.WEEK) {
    const nextWeek = date.add(1, 'week');
    range = `${date.format('DD.MM.YYYY')} -  ${nextWeek.format('DD.MM.YYYY')}`;
  } else if (currentRangeType === RANGE_TYPE.MONTH) {
    range = date.format('MMMM, YYYY');
  } else if (currentRangeType === RANGE_TYPE.YEAR) {
    range = date.format('YYYY');
  }

  return <div data-testid="RangeDisplay">{range}</div>;
};

export default RangeDisplay;
