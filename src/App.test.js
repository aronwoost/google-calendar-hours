import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import timekeeper from 'timekeeper';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import store from './stores';
import App from './App';

jest.mock('./utils/createBlobUrl', () => (content) => content);

const mockCalendarResponse = jest.fn();
const mockEventsResponse = jest.fn();

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

const renderApp = () =>
  render(
    <Provider store={store()}>
      <App />
    </Provider>
  );

beforeEach(() => {
  timekeeper.freeze(new Date('2018-01-01T10:00:00Z'));
  window.localStorage.setItem(
    'config',
    JSON.stringify({
      selectedCalendarId: 'test-id',
    })
  );

  window.sessionStorage.setItem('accessToken', 'ABC123');
  mockCalendarResponse.mockReturnValue([
    { id: 'test-id', summary: 'test-name' },
  ]);
  mockEventsResponse.mockReturnValue(testEvents);
});

const server = setupServer(
  rest.get(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    (req, res, ctx) => {
      const accessToken = req.url.searchParams.get('access_token');
      if (accessToken === 'return-403') {
        return res((_res) => {
          _res.status = 403;
          return _res;
        });
      }

      return res(ctx.json({ items: mockCalendarResponse() }));
    }
  ),
  rest.get(
    'https://www.googleapis.com/calendar/v3/calendars/:calendarId/events',
    (req, res, ctx) => {
      const accessToken = req.url.searchParams.get('access_token');
      const pageToken = req.url.searchParams.get('pageToken');

      if (accessToken === 'withNextPageToken') {
        if (!pageToken) {
          // first request (w/o pageToken)
          return res(
            ctx.json({ items: testEvents, nextPageToken: 'nextPageToken' })
          );
        }

        // second request (with pageToken)
        return res(ctx.json({ items: testEvents }));
      }

      return res(ctx.json({ items: mockEventsResponse() }));
    }
  )
);

delete window.location;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('renders auth screen', () => {
  window.location = {
    origin: 'http://test.com',
    pathname: '/testpath',
  };

  window.sessionStorage.removeItem('accessToken');

  renderApp();

  expect(
    screen.getByText('Google Calendar Hours Calculator')
  ).toBeInTheDocument();
  expect(screen.getByTestId('AuthLink')).toHaveAttribute(
    'href',
    'https://accounts.google.com/o/oauth2/auth?client_id=502172359025.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Ftest.com&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.events.readonly&response_type=token'
  );
  expect(screen.getByAltText('Auth with Google')).toBeInTheDocument();
  expect(
    screen.getByText('© 2011 - 2021. This app is open source.')
  ).toBeInTheDocument();
  expect(screen.getByText('Check it on GitHub')).toBeInTheDocument();
});

it('writes access token to sessionStorage and does redirect', () => {
  window.location = new URL(
    'https://www.example.com/hello#access_token=ABC123&foo=bar'
  );

  renderApp();

  expect(window.sessionStorage.getItem('accessToken')).toEqual('ABC123');
  expect(window.location).toBe('/');
});

it('delete access token from sessionStorage and does redirect when API returns non-200', async () => {
  window.sessionStorage.setItem('accessToken', 'return-403');

  renderApp();

  await waitFor(() =>
    expect(window.sessionStorage.getItem('accessToken')).toEqual(null)
  );

  expect(window.location).toBe('/');
});

it('renders "loading" without calendars', () => {
  renderApp();

  expect(screen.getByText('loading')).toBeInTheDocument();
});

it('renders without UI elements when calendars are loading but viewState values are set', async () => {
  window.localStorage.setItem(
    'config',
    JSON.stringify({
      selectedCalendarId: 'test-id',
      selectedRangeType: 'week',
    })
  );

  renderApp();

  expect(await screen.findByTestId('CalendarsList')).toBeInTheDocument();

  expect(screen.queryByTestId('RangeSelectList')).not.toBeInTheDocument();
  expect(screen.queryByTestId('RangeChanger')).not.toBeInTheDocument();
  expect(screen.queryByText('Week starts on:')).not.toBeInTheDocument();
  expect(screen.queryByTestId('RangeDisplay')).not.toBeInTheDocument();
});

it('renders "loading" when events are loading', async () => {
  renderApp();

  fireEvent.change(await screen.findByTestId('CalendarsList'), {
    target: { value: 'test-id-2' },
  });

  expect(screen.getByText('loading')).toBeInTheDocument();
});

it('renders static content', () => {
  renderApp();

  expect(
    screen.getByText('Google Calendar Hours Calculator')
  ).toBeInTheDocument();
  expect(
    screen.getByText('© 2011 - 2021. This app is open source.')
  ).toBeInTheDocument();
  expect(screen.getByText('Check it on GitHub')).toBeInTheDocument();
});

it('renders calendars list', () => {
  renderApp();

  expect(screen.queryByText('Please select calendar')).not.toBeInTheDocument();
});

it('requests calendars and display placeholder', async () => {
  window.localStorage.removeItem('config');

  renderApp();

  expect(await screen.findByText('Please select calendar')).toBeInTheDocument();
  expect(await screen.findByText('test-name')).toBeInTheDocument();
  expect(screen.queryByTestId('RangeSelectList')).not.toBeInTheDocument();
  expect(screen.queryByText('Loading hours')).not.toBeInTheDocument();
  expect(screen.queryByTestId('RangeChanger')).not.toBeInTheDocument();
});

it('renders default state (happy path)', async () => {
  renderApp();

  expect(await screen.findByText('Total')).toBeInTheDocument();
  expect(screen.getByText('Week')).toBeInTheDocument();
  expect(screen.getByText('1h')).toBeInTheDocument();
});

it('renders hours rounded', async () => {
  mockEventsResponse.mockReturnValue([
    {
      start: { dateTime: '2018-01-02T09:00:00Z' },
      end: { dateTime: '2018-01-02T09:05:00Z' },
    },
  ]);

  renderApp();

  expect(await screen.findByText('0.08h')).toBeInTheDocument();
});

it('renders correctly after user changes calendar', async () => {
  mockCalendarResponse.mockReturnValue([
    { id: 'test-id', label: 'test-name' },
    { id: 'test-id-2', label: 'test-name-2' },
  ]);
  mockEventsResponse.mockReturnValue(testEvents);

  renderApp();

  fireEvent.change(await screen.findByTestId('CalendarsList'), {
    target: { value: 'test-id-2' },
  });

  expect(await screen.findByText('1h')).toBeInTheDocument();
});

it('requests events, display hours and sets localStorage when loaded', async () => {
  renderApp();

  fireEvent.change(await screen.findByTestId('CalendarsList'), {
    target: { value: 'test-id' },
  });

  expect(await screen.findByText('1h')).toBeInTheDocument();

  expect(window.localStorage.getItem('config')).toEqual(
    '{"selectedCalendarId":"test-id"}'
  );
});

it('makes multiple event requests (when response contains nextPageToken)', async () => {
  window.sessionStorage.setItem('accessToken', 'withNextPageToken');
  renderApp();

  fireEvent.change(await screen.findByTestId('CalendarsList'), {
    target: { value: 'test-id' },
  });

  expect(await screen.findByText('2h')).toBeInTheDocument();
});

describe('localStorage', () => {
  it('saves user selection', async () => {
    renderApp();

    fireEvent.change(await screen.findByTestId('CalendarsList'), {
      target: { value: 'test-id' },
    });

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.click(screen.getByLabelText('Sunday'));

    expect(window.localStorage.getItem('config')).toEqual(
      '{"selectedCalendarId":"test-id","selectedRangeType":"week","weekStart":"sunday"}'
    );
  });

  it('saves start and end when user changes from week to custom', async () => {
    renderApp();

    fireEvent.change(await screen.findByTestId('CalendarsList'), {
      target: { value: 'test-id' },
    });

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.change(screen.getByTestId('RangeSelectList'), {
      target: { value: 'custom' },
    });

    expect(window.localStorage.getItem('config')).toEqual(
      '{"selectedCalendarId":"test-id","selectedRangeType":"custom","start":"2017-12-31T23:00:00.000Z","end":"2018-01-07T23:00:00.000Z"}'
    );
  });

  it('saves custom start and end', async () => {
    const { container } = renderApp();

    fireEvent.change(await screen.findByTestId('CalendarsList'), {
      target: { value: 'test-id' },
    });

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'custom' },
    });

    const dateInputs = container.querySelectorAll(
      '[data-testid="CustomRange"] input'
    );

    fireEvent.change(dateInputs[0], {
      target: { value: '2004-01-01' },
    });

    fireEvent.change(dateInputs[1], {
      target: { value: '2018-02-02' },
    });

    expect(window.localStorage.getItem('config')).toEqual(
      '{"selectedCalendarId":"test-id","start":"2004-01-01T00:00:00.000Z","end":"2018-02-02T00:00:00.000Z","selectedRangeType":"custom"}'
    );
  });

  it('reads data', async () => {
    timekeeper.freeze(new Date('2018-01-08T13:00:00Z'));
    window.localStorage.setItem(
      'config',
      JSON.stringify({
        selectedCalendarId: 'test-id',
        selectedRangeType: 'week',
        weekStart: 'sunday',
      })
    );

    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    // without {weekStart: 'sunday'} result would be 2h
    expect(await screen.findByText('3h')).toBeInTheDocument();
  });

  it('reads data with custom range', async () => {
    window.localStorage.setItem(
      'config',
      JSON.stringify({
        selectedCalendarId: 'test-id',
        selectedRangeType: 'custom',
        start: '2004-01-01T10:00:00.000Z',
        end: '2018-02-02T10:00:00.000Z',
      })
    );

    renderApp();

    expect(await screen.findByText('2h')).toBeInTheDocument();
  });

  it('clears selectedCalendarId when id is not part of the server response', async () => {
    window.localStorage.setItem(
      'config',
      JSON.stringify({
        selectedCalendarId: 'not-existing-calendar-id',
      })
    );

    renderApp();

    expect(
      await screen.findByText('Please select calendar')
    ).toBeInTheDocument();

    expect(window.localStorage.getItem('config')).toEqual(
      '{"selectedCalendarId":null}'
    );
  });
});

describe('calculate hours', () => {
  it('renders 0h hours (if not matching events)', async () => {
    mockEventsResponse.mockReturnValue([
      {
        start: { dateTime: '2018-01-20T10:00:00Z' },
        end: { dateTime: '2018-01-20T11:00:00Z' },
      },
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    expect(screen.getByText('0h')).toBeInTheDocument();

    expect(screen.queryByText('show details')).not.toBeInTheDocument();
  });

  it('renders hours for day', async () => {
    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    expect(screen.getByText('2h')).toBeInTheDocument();

    expect(screen.queryByText('Week starts on:')).not.toBeInTheDocument();
    expect(screen.queryByTestId('CustomRange')).not.toBeInTheDocument();
  });

  it('renders hours for day when user changes to previous day', async () => {
    timekeeper.freeze(new Date('2018-01-02T10:00:00Z'));

    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    fireEvent.click(screen.getByText('Prev'));

    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for day when user changes to next day', async () => {
    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText('1h')).toBeInTheDocument();
  });

  it('renders hours for day when user resets', async () => {
    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    fireEvent.click(screen.getByText('Next'));

    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for week', async () => {
    timekeeper.freeze(new Date('2018-01-08T13:00:00Z'));

    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    expect(screen.getByText('2h')).toBeInTheDocument();

    expect(screen.getByText('Week starts on:')).toBeInTheDocument();
    expect(screen.getByText('Sunday')).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();

    expect(screen.queryByTestId('CustomRange')).not.toBeInTheDocument();
  });

  it('renders hours for week when user changes to previous week', async () => {
    timekeeper.freeze(new Date('2018-01-12T10:00:00Z'));

    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.click(screen.getByText('Prev'));

    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for week when user changes to next week', async () => {
    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText('1h')).toBeInTheDocument();
  });

  it('renders hours for week when user resets', async () => {
    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.click(screen.getByText('Next'));

    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for week when user sets week start to Sunday', async () => {
    timekeeper.freeze(new Date('2018-01-08T13:00:00Z'));

    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.click(screen.getByLabelText('Sunday'));

    // without "Sunday" result would be 2h
    expect(screen.getByText('3h')).toBeInTheDocument();
  });

  it('renders hours for month', async () => {
    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    expect(screen.getByText('2h')).toBeInTheDocument();

    expect(screen.queryByText('Week starts on:')).not.toBeInTheDocument();
    expect(screen.queryByTestId('CustomRange')).not.toBeInTheDocument();
  });

  it('renders hours for month when user changes to previous month', async () => {
    timekeeper.freeze(new Date('2018-02-01T10:00:00Z'));

    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    fireEvent.click(screen.getByText('Prev'));

    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for month when user changes to next month', async () => {
    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText('1h')).toBeInTheDocument();
  });

  it('renders hours for month when user resets', async () => {
    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    fireEvent.click(screen.getByText('Next'));

    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for year', async () => {
    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    expect(screen.getByText('2h')).toBeInTheDocument();

    expect(screen.queryByText('Week starts on:')).not.toBeInTheDocument();
    expect(screen.queryByTestId('CustomRange')).not.toBeInTheDocument();
  });

  it('renders hours for year when user changes to previous year', async () => {
    timekeeper.freeze(new Date('2019-01-01T10:00:00Z'));

    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    fireEvent.click(screen.getByText('Prev'));

    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for year when user changes to next year', async () => {
    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText('1h')).toBeInTheDocument();
  });

  it('renders hours for year when user resets', async () => {
    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    fireEvent.click(screen.getByText('Next'));

    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for total', async () => {
    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'total' },
    });

    expect(screen.getByText('3h')).toBeInTheDocument();

    expect(screen.queryByTestId('RangeChanger')).not.toBeInTheDocument();
    expect(screen.queryByTestId('CustomRange')).not.toBeInTheDocument();
  });

  it('renders hours for custom', async () => {
    // set to a tuesday
    timekeeper.freeze(new Date('2004-01-01T10:00:00Z'));

    mockEventsResponse.mockReturnValue([
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
    ]);

    const { container } = renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.change(screen.getByTestId('RangeSelectList'), {
      target: { value: 'custom' },
    });

    const dateInputs = container.querySelectorAll(
      '[data-testid="CustomRange"] input'
    );

    // inputs should have the value of previously selected range ("week" in this case)
    expect(dateInputs[0].value).toBe('2003-12-29');
    expect(dateInputs[1].value).toBe('2004-01-05');

    fireEvent.change(dateInputs[0], {
      target: { value: '2004-01-01' },
    });

    fireEvent.change(dateInputs[1], {
      target: { value: '2018-02-02' },
    });

    expect(screen.getByText('3h')).toBeInTheDocument();

    expect(screen.queryByTestId('RangeChanger')).not.toBeInTheDocument();

    // back to week
    fireEvent.change(screen.getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    expect(screen.getByText('1h')).toBeInTheDocument();
  });
});

describe('display time range in human readable format', () => {
  it('renders current day', async () => {
    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    expect(screen.getByText('Monday, January 1, 2018')).toBeInTheDocument();
  });

  it('renders current week', async () => {
    // set to a tuesday
    timekeeper.freeze(new Date('2018-01-02T10:00:00Z'));

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    expect(screen.getByText('01.01.2018 - 08.01.2018')).toBeInTheDocument();
  });

  it('renders current week with week start sunday', async () => {
    // set to a tuesday
    timekeeper.freeze(new Date('2018-01-02T10:00:00Z'));

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.click(screen.getByLabelText('Sunday'));

    expect(screen.getByText('31.12.2017 - 07.01.2018')).toBeInTheDocument();
  });

  it('renders current month', async () => {
    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    expect(screen.getByText('January, 2018')).toBeInTheDocument();
  });

  it('renders current year', async () => {
    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    expect(screen.getByText('2018')).toBeInTheDocument();
  });

  it('renders without RangeDisplay ("total")', async () => {
    renderApp();

    expect(await screen.findByTestId('RangeDisplay')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('RangeSelectList'), {
      target: { value: 'total' },
    });

    expect(screen.queryByTestId('RangeDisplay')).not.toBeInTheDocument();
  });
});

describe('display events', () => {
  it('renders events collapsed', async () => {
    timekeeper.freeze(new Date('2018-01-01T10:00:00Z'));

    mockEventsResponse.mockReturnValue([
      {
        id: '1',
        summary: 'event-1',
        start: { dateTime: '2018-01-01T10:00:00Z' },
        end: { dateTime: '2018-01-01T12:00:00Z' },
      },
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    expect(screen.getByText('show details')).toBeInTheDocument();

    expect(screen.queryByText('event-1')).not.toBeInTheDocument();
  });

  it('renders events', async () => {
    timekeeper.freeze(new Date('2018-01-01T10:00:00Z'));

    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    fireEvent.click(screen.getByText('show details'));

    expect(screen.getByText('hide details')).toBeInTheDocument();
    expect(screen.getByText('Sort by:')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();

    expect(screen.getByText('01.01.')).toBeInTheDocument();
    expect(screen.getByText('event-1')).toBeInTheDocument();
    expect(screen.getByText('2h')).toBeInTheDocument();

    expect(screen.getByText('05.01.')).toBeInTheDocument();
    expect(screen.getByText('event-2')).toBeInTheDocument();
    expect(screen.getByText('5h')).toBeInTheDocument();

    const downloadLink = screen.getByText('Export as CSV');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute(
      'download',
      'test-name_January_2018_(20180101110000).csv'
    );
    expect(downloadLink.getAttribute('href')).toMatchSnapshot();

    expect(screen.queryByText('event-3')).not.toBeInTheDocument();
  });

  it('renders events by amount', async () => {
    timekeeper.freeze(new Date('2018-01-01T10:00:00Z'));

    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    fireEvent.click(screen.getByText('show details'));

    fireEvent.click(screen.getByLabelText('Amount'));

    expect(screen.queryByText('Export as CSV')).not.toBeInTheDocument();

    const items = screen.queryAllByText(/event-[1-3]/);

    expect(items).toHaveLength(2);
    // confirm correct order
    expect(items[0]).toHaveTextContent('event-2');
    expect(items[1]).toHaveTextContent('event-1');
  });

  it('renders with events with same summary added together', async () => {
    timekeeper.freeze(new Date('2018-01-01T10:00:00Z'));

    mockEventsResponse.mockReturnValue([
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
    ]);

    renderApp();

    fireEvent.change(await screen.findByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    fireEvent.click(screen.getByText('show details'));
    fireEvent.click(screen.getByLabelText('Amount'));

    expect(screen.getByText('7h')).toBeInTheDocument();
  });
});
