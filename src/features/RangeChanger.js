import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import bootstrap from 'bootstrap/dist/css/bootstrap.css';

import { changeRange, resetRange, selectRangeType } from '../stores/viewState';
import { RANGE_TYPE } from '../constants';

const RangeChanger = () => {
  const dispatch = useDispatch();

  const currentRangeType = useSelector(selectRangeType);

  if (
    currentRangeType === RANGE_TYPE.TOTAL ||
    currentRangeType === RANGE_TYPE.CUSTOM
  ) {
    return null;
  }

  return (
    <div
      data-testid="RangeChanger"
      className={bootstrap['btn-group']}
      role="group"
    >
      <button
        type="button"
        className={cx(bootstrap.btn, bootstrap['btn-outline-secondary'])}
        onClick={() => dispatch(changeRange('prev'))}
      >
        Prev
      </button>
      <button
        type="button"
        className={cx(bootstrap.btn, bootstrap['btn-outline-secondary'])}
        onClick={() => dispatch(resetRange())}
      >
        Reset
      </button>
      <button
        type="button"
        className={cx(bootstrap.btn, bootstrap['btn-outline-secondary'])}
        onClick={() => dispatch(changeRange('next'))}
      >
        Next
      </button>
    </div>
  );
};

export default RangeChanger;
