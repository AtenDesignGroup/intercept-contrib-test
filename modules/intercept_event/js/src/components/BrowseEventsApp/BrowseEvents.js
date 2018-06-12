// React
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Lodash
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import mapValues from 'lodash/mapValues';

// Moment
import moment from 'moment';

/* eslint-disable */
import interceptClient from 'interceptClient';
import ViewSwitcher from 'intercept/ViewSwitcher';
import LoadingIndicator from 'intercept/LoadingIndicator';
import PageSpinner from 'intercept/PageSpinner';
/* eslint-enable */

import EventFilters from './../EventFilters';
import EventList from './../EventList';
import EventCalendar from './../EventCalendar';

const { constants, api, select } = interceptClient;
const c = constants;
const eventIncludes = ['image_primary', 'image_primary.field_media_image', 'field_room'];

const viewOptions = [{ key: 'list', value: 'List' }, { key: 'calendar', value: 'Calendar' }];

function getDate(value, view = 'day', boundary = 'start') {
  const method = boundary === 'start' ? 'startOf' : 'endOf';
  const date = moment(value)[method](view);

  // The calendar view may include date from the previous or next month
  // so we make sure to include the beginning of the first week and
  // end of the last week.
  if (view === 'month') {
    date[method]('week');
  }
  return date.toISOString();
}

function getDateSpan(value, view = 'day') {
  const start = getDate(value, view, 'start');
  const end = getDate(value, view, 'end');
  return [start, end];
}

function getPublishedFilters(value = true) {
  return {
    published: {
      path: 'status',
      value: value ? '1' : '0',
    },
  };
}

function getDateFilters(values, view = 'list', calView = 'day', date = new Date()) {
  const path = 'field_date_time.value';
  let operator = '>';
  let value = moment(new Date())
    .subtract(1, 'day')
    .endOf('day')
    .toISOString();

  // Handler Calendar view.
  // The date should be determined by the date and calendar view type
  // rather than the selected date value.
  if (view === 'calendar') {
    value = getDateSpan(date, calView);
    operator = 'BETWEEN';
  }
  else if (values[c.DATE_START] && values[c.DATE_END]) {
    value = [
      getDate(values[c.DATE_START], 'day', 'start'),
      getDate(values[c.DATE_END], 'day', 'end'),
    ];
    operator = 'BETWEEN';
  }
  else if (values[c.DATE_START]) {
    value = getDate(values[c.DATE_START], 'day', 'start');
    operator = '>';
  }
  else if (values[c.DATE_END]) {
    value = getDate(values[c.DATE_END], 'day', 'end');
    operator = '<';
  }

  return {
    data: {
      path,
      value,
      operator,
    },
  };
}

function getKeywordFilters(value, group = 'group') {
  const filters = {};

  if (!value.keyword) {
    return filters;
  }

  const operator = 'CONTAINS';
  const conjunction = 'OR';

  const types = [
    { id: 'tite', path: 'title' },
    { id: 'body', path: 'field_text_content.value' },
    { id: 'intro', path: 'field_text_intro.value' },
    { id: 'teaser', path: 'field_text_teaser.value' },
    { id: 'tags', path: 'field_event_tags.name' },
  ];

  filters[group] = {
    type: 'group',
    conjunction,
  };

  types.forEach((type) => {
    filters[type.id] = {
      memberOf: group,
      path: type.path,
      operator,
      value: value.keyword,
    };
  });

  return filters;
}

function getFilters(values, view = 'list', calView = 'day', date = new Date()) {
  const filter = {
    ...getPublishedFilters(true),
    ...getDateFilters(values, view, calView, date),
    ...getKeywordFilters(values, 'keyword'),
  };

  if (!values) {
    return filter;
  }

  const types = [
    { id: c.TYPE_EVENT_TYPE, path: 'field_event_type.uuid', conjunction: 'OR' },
    { id: c.TYPE_LOCATION, path: 'field_location.uuid', conjunction: 'OR' },
    { id: c.TYPE_AUDIENCE, path: 'field_event_audience.uuid', conjunction: 'OR' },
  ];

  types.forEach((type) => {
    if (values[type.id] && values[type.id].length > 0) {
      if (type.conjunction === 'AND') {
        const group = `${type.id}-group`;
        filter[group] = {
          type: 'group',
          conjunction: type.conjunction,
        };
        values[type.id].forEach((element, key) => {
          const id = `${type.id}-${key}`;
          filter[id] = {
            path: type.path,
            value: element,
            memberOf: group,
          };
        });
      }
      else {
        filter[type.id] = {
          path: type.path,
          value: values[type.id],
          operator: 'IN',
        };
      }
    }
  });

  return filter;
}

function getSortDirection(view, values) {
  let dir = 'ASC';
  if (view === 'list' && values[c.DATE_END] && !values[c.DATE_START]) {
    dir = 'DESC';
  }
  return dir;
}

function getRegistrationFilters(eventFilters) {
  return {
    ...mapValues(eventFilters, filter => ({
      ...filter,
      path: `field_event.${filter.path}`,
    })),
    status: {
      path: 'status',
      value: ['active', 'waitlist'],
      operator: 'IN',
    },
  };
}

class BrowseEvents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      calView: props.calView,
      date: props.date,
      filters: props.filters,
      view: props.view,
      fetcher: null,
    };
    this.handleCalendarNavigate = this.handleCalendarNavigate.bind(this);
    this.handleCalendarView = this.handleCalendarView.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleViewChange = this.handleViewChange.bind(this);
    this.setFetchers = this.setFetchers.bind(this);
    this.doFetch = debounce(this.doFetch, 500).bind(this);
    this.doFetchMore = this.doFetchMore.bind(this);
    this.handleScroll = throttle(this.handleScroll, 30, { leading: true }).bind(this);
  }

  componentDidMount() {
    this.setFetchers(this.props.filters, this.props.view, this.props.calView, this.props.date);
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  setFetchers(
    values = this.props.filters,
    view = this.props.view,
    calView = this.props.calView,
    date = this.props.date,
  ) {
    const options = {
      filters: getFilters(values, view, calView, date),
      include: eventIncludes,
      replace: true,
      sort: {
        date: {
          path: 'field_date_time.value',
          direction: getSortDirection(view, values),
        },
      },
      count: view === 'list' ? 10 : 0,
      headers: {
        'X-Consumer-ID': interceptClient.consumer,
      },
      limit: 10,
    };

    const fetcher = {
      [c.TYPE_EVENT]: api[c.TYPE_EVENT].fetcher(options),
      [c.TYPE_EVENT_REGISTRATION]: api[c.TYPE_EVENT_REGISTRATION].fetcher({
        ...options,
        filters: getRegistrationFilters(options.filters),
        include: null,
        fields: {
          [c.TYPE_EVENT_REGISTRATION]: ['field_event', 'field_user', 'status'],
        },
        sort: null,
      }),
    };

    this.setState({
      fetcher,
    });

    this.doFetch(fetcher);
  }

  handleViewChange = (value) => {
    this.props.onChangeView(value);
    this.setFetchers(this.props.filters, value, this.props.calView, this.props.date);
  };

  handleCalendarNavigate = (date, calView) => {
    this.props.onChangeDate(date);
    this.setFetchers(this.props.filters, 'calendar', calView, date);
  };

  handleCalendarView = (calView) => {
    this.props.onChangeCalView(calView);
    this.setFetchers(this.props.filters, 'calendar', calView, this.props.date);
  };

  handleFilterChange(values) {
    this.props.onChangeFilters(values);
    this.setFetchers(values);
  }

  handleScroll() {
    // The calendar view should fetch all visible events so no need to load on scroll.
    if (this.props.view === 'calendar') {
      return;
    }

    const windowHeight =
      'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight,
    );
    const windowBottom = windowHeight + window.pageYOffset;

    if (windowBottom >= docHeight - 1500) {
      this.doFetchMore(c.TYPE_EVENT);
      this.doFetchMore(c.TYPE_EVENT_REGISTRATION);
    }
  }

  doFetch(fetcher) {
    const { fetchEntities } = this.props;
    fetchEntities(fetcher[c.TYPE_EVENT]);
    fetchEntities(fetcher[c.TYPE_EVENT_REGISTRATION]);
  }

  doFetchMore(type) {
    const { fetchEntities, loading } = this.props;
    if (!loading[type] && !this.state.fetcher[type].isDone()) {
      fetchEntities(this.state.fetcher[type]);
    }
  }

  render() {
    const {
      props,
      handleCalendarNavigate,
      handleViewChange,
      handleCalendarView,
      handleFilterChange,
    } = this;
    const { calendarEvents, events, loading, filters, view, date, calView } = props;
    const eventsLoading = loading[c.TYPE_EVENT];
    const eventComponent =
      view === 'list' ? (
        <React.Fragment>
          <EventList events={events} loading={eventsLoading} />
          <LoadingIndicator loading={eventsLoading} />
        </React.Fragment>
      ) : (
        <EventCalendar
          events={calendarEvents}
          onNavigate={handleCalendarNavigate}
          onView={handleCalendarView}
          defaultView={calView}
          defaultDate={date}
        />
      );

    return (
      <div className="l--offset">
        <div className="clearfix">
          <div className="l__main">
            <div className="l--subsection">
              <ViewSwitcher value={view} handleChange={handleViewChange} options={viewOptions} />
              <PageSpinner loading={eventsLoading} />
              <EventFilters
                onChange={handleFilterChange}
                showDate={view === 'list'}
                filters={filters}
              />
            </div>
            <div className="l__primary">{eventComponent}</div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const dir = getSortDirection(ownProps.view, ownProps.filters);
  return {
    events: select[dir === 'DESC' ? 'eventsByDateAscending' : 'eventsByDateDescending'](state),
    loading: {
      [c.TYPE_EVENT]: select.recordsAreLoading(c.TYPE_EVENT)(state),
      [c.TYPE_EVENT_REGISTRATION]: select.recordsAreLoading(c.TYPE_EVENT_REGISTRATION)(state),
    },
    calendarEvents: select.calendarEvents(state),
  };
};

const mapDispatchToProps = dispatch => ({
  fetchEntities: (fetcher) => {
    dispatch(fetcher.next());
  },
});

BrowseEvents.propTypes = {
  calendarEvents: PropTypes.arrayOf(Object).isRequired,
  events: PropTypes.arrayOf(Object).isRequired,
  loading: PropTypes.object.isRequired,
  fetchEntities: PropTypes.func.isRequired,
  calView: PropTypes.string,
  date: PropTypes.instanceOf(Date),
  view: PropTypes.string,
  filters: PropTypes.object,
  onChangeCalView: PropTypes.func.isRequired,
  onChangeView: PropTypes.func.isRequired,
  onChangeFilters: PropTypes.func.isRequired,
  onChangeDate: PropTypes.func.isRequired,
};

BrowseEvents.defaultProps = {
  view: 'list',
  calView: 'month',
  date: new Date(),
  filters: {},
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BrowseEvents);
