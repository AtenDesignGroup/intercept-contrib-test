import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import debounce from 'lodash/debounce';
import interceptClient from 'interceptClient';
import ViewSwitcher from 'intercept/ViewSwitcher';
import PageSpinner from 'intercept/PageSpinner';
import EventFilters from './../EventFilters';
import EventList from './../EventList';
import EventCalendar from './../EventCalendar';

const { constants, api, select } = interceptClient;
const c = constants;
const eventIncludes = [
  'image_primary',
  'image_primary.field_media_image',
  'field_room',
];

const viewOptions = [
  { key: 'list', value: 'List' },
  { key: 'calendar', value: 'Calendar' },
];

function getDateSpan(value, view = 'day') {
  const start = moment(value).startOf(view);
  const end = moment(value).endOf(view);

  // The calendar view may include date from the previous or next month
  // so we make sure to include the beginning of the first week and
  // end of the last week.
  if (view === 'month') {
    start.startOf('week');
    end.endOf('week');
  }
  return [start.toISOString(), end.toISOString()];
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
  else if (values.date) {
    value = getDateSpan(values.date, 'day');
    operator = 'BETWEEN';
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

class BrowseEvents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      calView: props.calView,
      date: props.date,
      filters: props.filters,
      view: props.view,
    };
    this.handleCalendarNavigate = this.handleCalendarNavigate.bind(this);
    this.handleCalendarView = this.handleCalendarView.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleViewChange = this.handleViewChange.bind(this);
    this.doFetchEvents = debounce(this.doFetchEvents, 500).bind(this);
  }

  componentDidMount() {
    this.doFetchEvents(this.props.filters, this.props.view, this.props.calView, this.props.date);
  }

  handleViewChange = (value) => {
    this.props.onChangeView(value);
    this.doFetchEvents(this.props.filters, value, this.props.calView, this.props.date);
  };

  handleCalendarNavigate = (date, calView) => {
    this.props.onChangeDate(date);
    this.doFetchEvents(this.props.filters, 'calendar', calView, date);
  };

  handleCalendarView = (calView) => {
    this.props.onChangeCalView(calView);
    this.doFetchEvents(this.props.filters, 'calendar', calView, this.props.date);
  };

  handleFilterChange(values) {
    this.props.onChangeFilters(values);
    this.doFetchEvents(values);
  }

  doFetchEvents(
    values = this.props.filters,
    view = this.props.view,
    calView = this.props.calView,
    date = this.props.date,
  ) {
    const { fetchEvents } = this.props;

    fetchEvents({
      filters: getFilters(values, view, calView, date),
      include: eventIncludes,
      replace: true,
      headers: {
        'X-Consumer-ID': interceptClient.consumer,
      },
    });
  }

  render() {
    const {
      props,
      handleCalendarNavigate,
      handleViewChange,
      handleCalendarView,
      handleFilterChange,
    } = this;
    const { calendarEvents, events, eventsLoading, filters, view, date, calView } = props;

    const eventComponent =
      view === 'list' ? (
        <EventList events={events} />
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

const mapStateToProps = state => ({
  events: select.eventsByDateAscending(state),
  eventsLoading: select.recordsAreLoading(c.TYPE_EVENT)(state),
  calendarEvents: select.calendarEvents(state),
});

const mapDispatchToProps = dispatch => ({
  fetchEvents: (options) => {
    dispatch(api[c.TYPE_EVENT].fetchAll(options));
  },
});

BrowseEvents.propTypes = {
  calendarEvents: PropTypes.arrayOf(Object).isRequired,
  events: PropTypes.arrayOf(Object).isRequired,
  eventsLoading: PropTypes.bool.isRequired,
  fetchEvents: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(BrowseEvents);
