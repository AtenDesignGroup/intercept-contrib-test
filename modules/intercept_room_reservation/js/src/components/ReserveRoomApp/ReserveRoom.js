import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import debounce from 'lodash/debounce';
import interceptClient from 'interceptClient';
import ViewSwitcher from 'intercept/ViewSwitcher';
import PageSpinner from 'intercept/PageSpinner';
import RoomFilters from './../RoomFilters';
import ReserveRoomForm from './../ReserveRoomForm';
import RoomList from './../RoomList';
import RoomCalendar from './../RoomCalendar';
import SelectResource from 'intercept/SelectResource';

const { constants, api, select } = interceptClient;
const c = constants;
const roomIncludes = ['image_primary', 'image_primary.field_media_image'];

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

function getFilters(values, view = 'list', calView = 'day', date = new Date()) {
  const filter = {
    ...getPublishedFilters(true),
  };

  if (!values) {
    return filter;
  }

  const types = [
    { id: c.TYPE_ROOM_TYPE, path: 'field_room_type.uuid', conjunction: 'OR' },
    { id: c.TYPE_LOCATION, path: 'field_location.uuid', conjunction: 'OR' },
    // { id: c.TYPE_AUDIENCE, path: 'field_event_audience.uuid', conjunction: 'OR' },
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

class ReserveRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      calView: props.calView,
      date: props.date,
      filters: props.filters,
      formValues: {
        date: null,
        start: null,
        end: null,
        room: null,
      },
      view: props.view,
    };
    this.handleCalendarNavigate = this.handleCalendarNavigate.bind(this);
    this.handleCalendarView = this.handleCalendarView.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleViewChange = this.handleViewChange.bind(this);
    this.handleFormChange = this.handleViewChange.bind(this);
    this.doFetchRooms = debounce(this.doFetchRooms, 500).bind(this);
  }

  componentDidMount() {
    this.doFetchRooms(this.props.filters, this.props.view, this.props.calView, this.props.date);
  }

  handleViewChange = (value) => {
    this.props.onChangeView(value);
    this.doFetchRooms(this.props.filters, value, this.props.calView, this.props.date);
  };

  handleCalendarNavigate = (date, calView) => {
    this.props.onChangeDate(date);
    this.doFetchRooms(this.props.filters, 'calendar', calView, date);
  };

  handleCalendarView = (calView) => {
    this.props.onChangeCalView(calView);
    this.doFetchRooms(this.props.filters, 'calendar', calView, this.props.date);
  };

  handleFilterChange(values) {
    this.props.onChangeFilters(values);
    this.doFetchRooms(values);
  }

  handleFormChange(formValues) {
    this.setState = {
      formValues,
    };
  }

  doFetchRooms(
    values = this.props.filters,
    view = this.props.view,
    calView = this.props.calView,
    date = this.props.date,
  ) {
    const { fetchRooms } = this.props;

    fetchRooms({
      filters: getFilters(values, view, calView, date),
      include: roomIncludes,
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
      handleFormChange,
    } = this;
    const { calendarRooms, rooms, roomsLoading, filters, view, date, calView } = props;

    const selectionComponent = null;
      // view === 'list' ? (
      //   <RoomList rooms={rooms} />
      // ) : (
      //   <RoomCalendar
      //     rooms={calendarRooms}
      //     onNavigate={handleCalendarNavigate}
      //     onView={handleCalendarView}
      //     defaultView={calView}
      //     defaultDate={date}
      //   />
      // );

    return (
      <div className="l--offset l--sidebar-before">
        <header className="l__header">
          <h1 className="page-title">Reserve a Room</h1>
        </header>
        <div className="l__main">
          <div className="l__secondary">
            <h4 className="page-title">Reservation Details</h4>
            <ReserveRoomForm onChange={handleFormChange} />
          </div>
          <div className="l__primary">
            <ViewSwitcher value={view} handleChange={handleViewChange} />
            <RoomFilters
              onChange={handleFilterChange}
              showDate={view === 'list'}
              filters={filters}
            />
            <PageSpinner loading={roomsLoading} />
            {selectionComponent}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  rooms: select.roomsAscending(state),
  roomsLoading: select.recordsAreLoading(c.TYPE_ROOM)(state),
  calendarRooms: [],
});

const mapDispatchToProps = dispatch => ({
  fetchRooms: (options) => {
    dispatch(api[c.TYPE_ROOM].fetchAll(options));
  },
});

ReserveRoom.propTypes = {
  calendarRooms: PropTypes.arrayOf(Object).isRequired,
  rooms: PropTypes.arrayOf(Object).isRequired,
  roomsLoading: PropTypes.bool.isRequired,
  fetchRooms: PropTypes.func.isRequired,
  calView: PropTypes.string,
  date: PropTypes.instanceOf(Date),
  view: PropTypes.string,
  filters: PropTypes.object,
  onChangeCalView: PropTypes.func.isRequired,
  onChangeView: PropTypes.func.isRequired,
  onChangeFilters: PropTypes.func.isRequired,
  onChangeDate: PropTypes.func.isRequired,
};

ReserveRoom.defaultProps = {
  view: 'list',
  calView: 'month',
  date: new Date(),
  filters: {},
};

export default connect(mapStateToProps, mapDispatchToProps)(ReserveRoom);
