import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import timekeeper from 'timekeeper';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { store } from './stores';
import App from './App';
import { getInitialState } from './stores/viewState';

jest.mock('./utils/createBlobUrl', () => (content) => content);

const createTestStore = ({
  authentication,
  viewState,
  calendars,
  calendarEvents,
}) =>
  store({
    initialState: {
      authentication: { accessToken: 'ABC123', ...authentication },
      viewState: {
        ...getInitialState(),
        selectedCalendarId: 'test-id',
        ...viewState,
      },
      calendars: {
        list: [{ id: 'test-id', label: 'test-name' }],
        ...calendars,
      },
      calendarEvents,
    },
  });

const renderAppWithStore = ({
  authentication,
  viewState,
  calendars,
  calendarEvents,
} = {}) =>
  render(
    <Provider
      store={createTestStore({
        authentication,
        viewState,
        calendars,
        calendarEvents,
      })}
    >
      <App />
    </Provider>
  );

beforeEach(() => {
  timekeeper.freeze(new Date('2018-01-01T10:00:00Z'));
  window.localStorage.removeItem('config');
});

const testEvents = [
  {
    start: { dateTime: '2016-01-01T10:00:00Z' },
    end: { dateTime: '2016-01-01T11:00:00Z' },
  },
  {
    start: { dateTime: '2018-01-02T10:00:00Z' },
    end: { dateTime: '2018-01-02T11:00:00Z' },
  },
];

const server = setupServer(
  rest.get(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    (req, res, ctx) => {
      const accessToken = req.url.searchParams.get('access_token');
      if (accessToken !== 'ABC123') {
        return res(403);
      }

      return res(
        ctx.json({ items: [{ id: 'test-id', summary: 'test-name' }] })
      );
    }
  ),
  rest.get(
    'https://www.googleapis.com/calendar/v3/calendars/test-id/events?maxResults=2500&singleEvents=true',
    (req, res, ctx) => {
      const accessToken = req.url.searchParams.get('access_token');
      if (accessToken !== 'ABC123') {
        return res(403);
      }

      return res(ctx.json({ items: testEvents }));
    }
  )
);

delete window.location;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('renders google auth button', () => {
  const { getByAltText } = renderAppWithStore({
    authentication: { accessToken: null },
  });

  expect(getByAltText('Auth with Google')).toBeInTheDocument();
});

it('writes access token to localStorage and does redirect', () => {
  window.location = new URL(
    'https://www.example.com/hello#access_token=ABC123'
  );

  renderAppWithStore({
    authentication: { accessToken: null },
  });

  expect(window.localStorage.getItem('accessToken')).toEqual('ABC123');
  expect(window.location).toBe('/');
});

it('renders "loading" without calendars', () => {
  const { getByText } = renderAppWithStore({ calendars: { list: null } });

  expect(getByText('loading')).toBeInTheDocument();
});

it('renders calendars list', () => {
  const { queryByText } = renderAppWithStore();

  expect(queryByText('Please select calendar')).not.toBeInTheDocument();
});

it('requests calendars and display placeholder', async () => {
  const { findByText, queryByTestId, queryByText } = renderAppWithStore({
    viewState: { selectedCalendarId: null },
    calendars: { list: null },
  });

  expect(await findByText('Please select calendar')).toBeInTheDocument();
  expect(await findByText('test-name')).toBeInTheDocument();
  expect(queryByTestId('RangeSelectList')).not.toBeInTheDocument();
  expect(queryByText('Loading hours')).not.toBeInTheDocument();
  expect(queryByTestId('RangeChanger')).not.toBeInTheDocument();
});

it('renders range select list and hours (happy path)', () => {
  const { getByText } = renderAppWithStore({
    calendarEvents: {
      map: { 'test-id': testEvents },
    },
  });

  expect(getByText('Total')).toBeInTheDocument();
  expect(getByText('Week')).toBeInTheDocument();
  expect(getByText('2h')).toBeInTheDocument();
});

it('renders correctly after user changes calendar', () => {
  const { getByTestId, getByText } = renderAppWithStore({
    calendars: {
      list: [
        { id: 'test-id', label: 'test-name' },
        { id: 'test-id-2', label: 'test-name-2' },
      ],
    },
    calendarEvents: {
      map: { 'test-id': [], 'test-id-2': testEvents },
    },
  });

  fireEvent.change(getByTestId('CalendarsList'), {
    target: { value: 'test-id-2' },
  });

  expect(getByText('2h')).toBeInTheDocument();
});

it('requests events, display hours and sets localStorage when loaded', async () => {
  const { getByTestId, findByText } = renderAppWithStore();

  fireEvent.change(getByTestId('CalendarsList'), {
    target: { value: 'test-id' },
  });

  expect(await findByText('2h')).toBeInTheDocument();

  expect(window.localStorage.getItem('config')).toEqual(
    '{"selectedCalendarId":"test-id"}'
  );
});

describe('localStorage', () => {
  it('saves user selection to localStorage', () => {
    const { getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: { 'test-id': testEvents },
      },
    });

    fireEvent.change(getByTestId('CalendarsList'), {
      target: { value: 'test-id' },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    expect(window.localStorage.getItem('config')).toEqual(
      '{"selectedCalendarId":"test-id","selectedRangeType":"week"}'
    );
  });

  it('uses data from localStorage to sets UI', async () => {
    window.localStorage.setItem(
      'config',
      JSON.stringify({
        selectedCalendarId: 'test-id',
        selectedRangeType: 'week',
      })
    );

    const { findByText } = renderAppWithStore({
      viewState: {
        selectedCalendarId: null,
      },
      calendars: {
        list: null,
      },
    });

    expect(await findByText('1h')).toBeInTheDocument();
  });
});

describe('calculate hours', () => {
  it('renders 0h hours (if not matching events)', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-20T10:00:00Z' },
              end: { dateTime: '2018-01-20T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    expect(getByText('0h')).toBeInTheDocument();
  });

  it('renders hours for day', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-10T10:00:00Z' },
              end: { dateTime: '2018-01-10T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for day when user changes to previous day', () => {
    timekeeper.freeze(new Date('2018-01-02T10:00:00Z'));

    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-02T10:00:00Z' },
              end: { dateTime: '2018-01-02T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    fireEvent.click(getByText('Prev'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for day when user changes to next day', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-02T10:00:00Z' },
              end: { dateTime: '2018-01-02T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    fireEvent.click(getByText('Next'));

    expect(getByText('1h')).toBeInTheDocument();
  });

  it('renders hours for day when user resets', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-02T10:00:00Z' },
              end: { dateTime: '2018-01-02T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    fireEvent.click(getByText('Next'));

    fireEvent.click(getByText('Reset'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for week', () => {
    timekeeper.freeze(new Date('2018-01-08T13:00:00Z'));

    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-07T10:00:00Z' },
              end: { dateTime: '2018-01-07T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-08T13:00:00Z' },
              end: { dateTime: '2018-01-08T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-09T10:00:00Z' },
              end: { dateTime: '2018-01-09T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for week when user changes to previous week', () => {
    timekeeper.freeze(new Date('2018-01-12T10:00:00Z'));

    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-12T10:00:00Z' },
              end: { dateTime: '2018-01-12T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.click(getByText('Prev'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for week when user changes to next week', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-12T10:00:00Z' },
              end: { dateTime: '2018-01-12T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.click(getByText('Next'));

    expect(getByText('1h')).toBeInTheDocument();
  });

  it('renders hours for week when user resets', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-12T10:00:00Z' },
              end: { dateTime: '2018-01-12T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.click(getByText('Next'));

    fireEvent.click(getByText('Reset'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for month', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-14T13:00:00Z' },
              end: { dateTime: '2018-01-14T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for month when user changes to previous month', () => {
    timekeeper.freeze(new Date('2018-02-01T10:00:00Z'));

    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    fireEvent.click(getByText('Prev'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for month when user changes to next month', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    fireEvent.click(getByText('Next'));

    expect(getByText('1h')).toBeInTheDocument();
  });

  it('renders hours for month when user resets', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    fireEvent.click(getByText('Next'));

    fireEvent.click(getByText('Reset'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for year', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2017-01-01T10:00:00Z' },
              end: { dateTime: '2017-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-14T13:00:00Z' },
              end: { dateTime: '2018-01-14T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for year when user changes to previous year', () => {
    timekeeper.freeze(new Date('2019-01-01T10:00:00Z'));

    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2019-01-01T10:00:00Z' },
              end: { dateTime: '2019-01-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    fireEvent.click(getByText('Prev'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for year when user changes to next year', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2019-01-01T10:00:00Z' },
              end: { dateTime: '2019-01-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    fireEvent.click(getByText('Next'));

    expect(getByText('1h')).toBeInTheDocument();
  });

  it('renders hours for year when user resets', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2019-01-01T10:00:00Z' },
              end: { dateTime: '2019-01-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    fireEvent.click(getByText('Next'));

    fireEvent.click(getByText('Reset'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for total', () => {
    const { getByText, getByTestId, queryByTestId } = renderAppWithStore({
      calendarEvents: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2004-01-01T10:00:00Z' },
              end: { dateTime: '2004-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2010-01-14T13:00:00Z' },
              end: { dateTime: '2010-01-14T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'total' },
    });

    expect(getByText('3h')).toBeInTheDocument();

    expect(queryByTestId('RangeChanger')).not.toBeInTheDocument();
  });
});

describe('display time range in human readable format', () => {
  it('renders current day', () => {
    const { getByText } = renderAppWithStore({
      viewState: { selectedRangeType: 'day' },
      calendarEvents: { map: { 'test-id': [] } },
    });

    expect(getByText('Monday, January 1, 2018')).toBeInTheDocument();
  });

  it('renders current week', () => {
    // set to a tuesday
    timekeeper.freeze(new Date('2018-01-02T10:00:00Z'));

    const { getByText } = renderAppWithStore({
      viewState: { selectedRangeType: 'week' },
      calendarEvents: { map: { 'test-id': [] } },
    });

    expect(getByText('01.01.2018 - 08.01.2018')).toBeInTheDocument();
  });

  it('renders current month', () => {
    const { getByText } = renderAppWithStore({
      viewState: { selectedRangeType: 'month' },
      calendarEvents: { map: { 'test-id': [] } },
    });

    expect(getByText('January, 2018')).toBeInTheDocument();
  });

  it('renders current year', () => {
    const { getByText } = renderAppWithStore({
      viewState: { selectedRangeType: 'year' },
      calendarEvents: { map: { 'test-id': [] } },
    });

    expect(getByText('2018')).toBeInTheDocument();
  });

  it('renders without RangeDisplay ("total")', () => {
    const { queryByTestId } = renderAppWithStore({
      viewState: { selectedRangeType: 'total' },
      calendarEvents: { map: { 'test-id': [] } },
    });

    expect(queryByTestId('RangeDisplay')).not.toBeInTheDocument();
  });
});

describe('display events', () => {
  it('renders events collapsed', () => {
    timekeeper.freeze(new Date('2018-01-01T10:00:00Z'));

    const { getByText, queryByText } = renderAppWithStore({
      viewState: { selectedRangeType: 'month' },
      calendarEvents: {
        map: { 'test-id': [] },
      },
    });

    expect(getByText('show details')).toBeInTheDocument();

    expect(queryByText('event-1')).not.toBeInTheDocument();
  });

  it('renders events', async () => {
    timekeeper.freeze(new Date('2018-01-01T10:00:00Z'));

    const { getByText, queryByText } = renderAppWithStore({
      viewState: { selectedRangeType: 'month' },
      calendarEvents: {
        map: {
          'test-id': [
            {
              id: '1',
              summary: 'event-1',
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T12:00:00Z' },
            },
            {
              id: '2',
              summary: 'event-2',
              start: { dateTime: '2018-01-05T13:00:00Z' },
              end: { dateTime: '2018-01-05T18:00:00Z' },
            },
            {
              id: '3',
              summary: 'event-3',
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.click(getByText('show details'));

    expect(getByText('hide details')).toBeInTheDocument();
    expect(getByText('Sort by:')).toBeInTheDocument();
    expect(getByText('Date')).toBeInTheDocument();
    expect(getByText('Amount')).toBeInTheDocument();

    expect(getByText('01.01.')).toBeInTheDocument();
    expect(getByText('event-1')).toBeInTheDocument();
    expect(getByText('2h')).toBeInTheDocument();

    expect(getByText('05.01.')).toBeInTheDocument();
    expect(getByText('event-2')).toBeInTheDocument();
    expect(getByText('5h')).toBeInTheDocument();

    const downloadLink = getByText('Export as CSV');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink.getAttribute('download')).toBe(
      'test-name_January_2018_(20180101110000).csv'
    );
    expect(downloadLink.getAttribute('href')).toMatchSnapshot();

    expect(queryByText('event-3')).not.toBeInTheDocument();
  });

  it('renders events by amount', async () => {
    timekeeper.freeze(new Date('2018-01-01T10:00:00Z'));

    const {
      getByText,
      getByLabelText,
      queryAllByText,
      queryByText,
    } = renderAppWithStore({
      viewState: { selectedRangeType: 'month' },
      calendarEvents: {
        map: {
          'test-id': [
            {
              id: '1',
              summary: 'event-1',
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T12:00:00Z' },
            },
            {
              id: '2',
              summary: 'event-2',
              start: { dateTime: '2018-01-05T13:00:00Z' },
              end: { dateTime: '2018-01-05T18:00:00Z' },
            },
            {
              id: '3',
              summary: 'event-3',
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.click(getByText('show details'));

    fireEvent.click(getByLabelText('Amount'));

    expect(queryByText('Export as CSV')).not.toBeInTheDocument();

    const items = queryAllByText(/event-[1-3]/);

    expect(items).toHaveLength(2);
    // confirm correct order
    expect(items[0]).toHaveTextContent('event-2');
    expect(items[1]).toHaveTextContent('event-1');
  });

  it('renders with events with same summary added together', async () => {
    timekeeper.freeze(new Date('2018-01-01T10:00:00Z'));

    const { getByText, getByLabelText } = renderAppWithStore({
      viewState: { selectedRangeType: 'month' },
      calendarEvents: {
        map: {
          'test-id': [
            {
              id: '1',
              summary: 'test summary',
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T12:00:00Z' },
            },
            {
              id: '2',
              summary: 'test summary',
              start: { dateTime: '2018-01-05T13:00:00Z' },
              end: { dateTime: '2018-01-05T18:00:00Z' },
            },
            {
              id: '3',
              summary: 'some other event',
              start: { dateTime: '2018-01-06T10:00:00Z' },
              end: { dateTime: '2018-01-06T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.click(getByText('show details'));
    fireEvent.click(getByLabelText('Amount'));

    expect(getByText('7h')).toBeInTheDocument();
  });
});
