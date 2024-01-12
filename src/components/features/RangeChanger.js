import React from 'react';
import { useDispatch } from 'react-redux';
import cx from 'classnames';

import { changeRange, resetRange } from '../stores/viewState';

const RangeChanger = () => {
  const dispatch = useDispatch();

  return (
    <div data-testid="RangeChanger" className="btn-group" role="group">
      <button
        type="button"
        className={cx('btn', 'btn-outline-secondary')}
        onClick={() => dispatch(changeRange('prev'))}
      >
        Prev
      </button>
      <button
        type="button"
        className={cx('btn', 'btn-outline-secondary')}
        onClick={() => dispatch(resetRange())}
      >
        Reset
      </button>
      <button
        type="button"
        className={cx('btn', 'btn-outline-secondary')}
        onClick={() => dispatch(changeRange('next'))}
      >
        Next
      </button>
    </div>
  );
};

export default RangeChanger;
