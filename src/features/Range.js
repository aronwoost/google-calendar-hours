import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';

import {
  changeRangeType,
  selectSelectedCalendar,
  selectRangeType,
} from '../stores/viewState';

import bootstrap from '../bootstrap.module.css';

const Range = () => {
  const dispatch = useDispatch();

  const selectedCalendar = useSelector(selectSelectedCalendar);
  const currentRangeType = useSelector(selectRangeType);

  if (!selectedCalendar) {
    return null;
  }

  return (
    <select
      data-testid="RangeSelectList"
      className={cx(bootstrap['form-select'])}
      onChange={(event) =>
        dispatch(changeRangeType({ range: event.target.value }))
      }
      value={currentRangeType}
    >
      <option value="day">Day</option>
      <option value="week">Week</option>
      <option value="month">Month</option>
      <option value="year">Year</option>
      <option value="total">Total</option>
      <option value="custom">Custom</option>
    </select>
  );
};

export default Range;
