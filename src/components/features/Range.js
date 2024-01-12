import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { changeRangeType, selectRangeType } from '../stores/viewState';

const Range = () => {
  const dispatch = useDispatch();

  const currentRangeType = useSelector(selectRangeType);

  return (
    <select
      data-testid="RangeSelectList"
      className="form-select"
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
