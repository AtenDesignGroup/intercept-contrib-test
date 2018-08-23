import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import interceptClient from 'interceptClient';
import drupalSettings from 'drupalSettings';

// Material UI
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';

// Intercept Components
import LoadingIndicator from 'intercept/LoadingIndicator';
import PageSpinner from 'intercept/PageSpinner';
import RoomTeaser from 'intercept/RoomTeaser';
import SelectResource from 'intercept/SelectResource';
import ViewSwitcher from 'intercept/ViewSwitcher';

// Local Components
import RoomFilters from './RoomFilters';
import RoomList from './RoomList';
// import { get } from 'https';

const { constants, api, select, utils } = interceptClient;
const c = constants;
const ATTENDEES = 'attendees';
const TIME = 'time';
const DURATION = 'duration';
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

function getRoomsWithLocationsFilters() {
  return {
    withLocation: {
      path: 'field_location',
      value: null,
      operator: '<>',
    },
  };
}

function getRoleBasedFilters() {
  let filter = {
    staffOnly: {
      path: 'field_staff_use_only',
      value: false,
    },
  };

  if (utils.userIsStaff()) {
    filter = {};
  }

  return filter;
}

function getAttendeesFilters(values = {}) {
  if (!values[ATTENDEES]) {
    return {};
  }

  return {
    capacity: {
      path: 'field_capacity_max',
      value: values[ATTENDEES],
      operator: '>=',
    },
  };
}

function getDateFilters(values, view = 'list', calView = 'day', date = new Date()) {
  const path = 'field_date_time.value';
  let operator = '>';
  let value = moment()
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

function getFilters(values) {
  const filter = {
    ...getPublishedFilters(true),
    ...getAttendeesFilters(values),
    ...getRoleBasedFilters(),
    ...getRoomsWithLocationsFilters(),
  };

  if (!values) {
    return filter;
  }

  const types = [
    { id: c.TYPE_ROOM_TYPE, path: 'field_room_type.uuid', conjunction: 'OR' },
    { id: c.TYPE_LOCATION, path: 'field_location.uuid', conjunction: 'OR' },
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

// Filter function for room keyword searchs.
const byKeyword = keyword => (room) => {
  if (!keyword) {
    return true;
  }

  const haystack = get(room, 'data.attributes.title').toLowerCase();
  const needle = keyword.toLowerCase();

  return haystack.indexOf(needle) >= 0;
};

class ReserveRoomStep1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      calView: props.calView,
      date: props.date,
      filters: props.filters,
      formValues: {
        [c.TYPE_ROOM]: null,
        date: null,
        start: moment()
          .startOf('hour')
          .add(1, 'h')
          .toDate(),
        end: moment()
          .startOf('hour')
          .add(2, 'h')
          .toDate(),
        attendees: 1,
        groupName: '',
        meeting: false,
        meetingStart: moment()
          .startOf('hour')
          .add(1, 'h')
          .toDate(),
        meetingEnd: moment()
          .startOf('hour')
          .add(2, 'h')
          .toDate(),
        [c.TYPE_MEETING_PURPOSE]: null,
        meetingDetails: '',
        refreshments: false,
        refreshmentsDesc: '',
        user: drupalSettings.intercept.user.uuid,
      },
      view: props.view,
      room: {
        current: null,
        previous: null,
        exiting: false,
      },
      availability: {
        loading: false,
        shouldUpdate: false,
        rooms: [],
      },
    };
    this.doFetchRooms = debounce(this.doFetchRooms, 500).bind(this);
    this.fetchAvailableRooms = debounce(this.fetchAvailableRooms, 200).bind(this);
  }

  componentDidMount() {
    this.doFetchRooms(this.props.filters, this.props.view, this.props.calView, this.props.date);
    this.props.fetchLocations();
    this.mounted = true;
  }

  componentDidUpdate(prevProps) {
    const { availability } = this.state;
    const { filters, rooms } = this.props;
    const didUpdate = prop => !isEqual(prevProps[prop], this.props[prop]);

    if (filters[c.DATE] && (didUpdate('rooms') || didUpdate('filters'))) {
      this.setState({
        availability: {
          ...this.state.availability,
          shouldUpdate: true,
        },
      });
    }

    // Fetch room availabilty if necessary.
    if (rooms.length > 0 && availability.shouldUpdate && !availability.loading) {
      this.fetchAvailableRooms();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onExited() {
    this.setState({
      room: {
        ...this.state.room,
        exiting: false,
      },
    });
  }

  // Get query params based on current rooms and filters.
  getRoomAvailabilityQuery = () => {
    const options = {
      rooms: this.props.rooms.map(i => i.data.id),
      duration: 30,
    };

    const tz = utils.getUserTimezone();

    if (this.props.filters[c.DATE]) {
      const date = moment.tz(this.props.filters[c.DATE], tz);
      options.start = date.clone().hour(0);
      options.end = date.clone().endOf('day');

      switch (this.props.filters[TIME]) {
        case 'morning':
          options.end.hour(11);
          break;
        case 'afternoon':
          options.start.hour(12);
          options.end.hour(16);
          break;
        case 'evening':
          options.start.hour(17);
          options.end.hour(23);
          break;
        default:
          break;
      }

      options.start = utils.dateToDrupal(options.start);
      options.end = utils.dateToDrupal(options.end);
    }

    if (this.props.filters[DURATION]) {
      options.duration = this.props.filters[DURATION];
    }

    return options;
  };

  // Requests available rooms
  fetchAvailableRooms() {
    this.setState({
      availability: {
        ...this.state.availability,
        loading: true,
        shouldUpdate: false,
      },
    });

    fetch('/api/rooms/availability', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(this.getRoomAvailabilityQuery()),
    })
      .then(res => res.text())
      .then(this.handleAvailabiltyResponse)
      .catch((e) => {
        console.log(e);
        if (this.mounted) {
          this.setState({
            availability: {
              ...this.state.availability,
              loading: false,
              shouldUpdate: false,
            },
          });
        }
      });
  }

  handleAvailabiltyResponse = (res) => {
    if (this.mounted) {
      this.setState({
        availability: {
          ...this.state.availability,
          loading: false,
          rooms: JSON.parse(res),
          shouldUpdate: false,
        },
      });
    }
  };

  handleRoomSelect = (value) => {
    this.props.onChangeRoom(value);
    this.props.onChangeStep(1);
  };

  handleCalendarNavigate = (date, calView) => {
    this.props.onChangeDate(date);
    this.doFetchRooms(this.props.filters, 'calendar', calView, date);
  };

  handleCalendarView = (calView) => {
    this.props.onChangeCalView(calView);
    this.doFetchRooms(this.props.filters, 'calendar', calView, this.props.date);
  };

  handleFilterChange = (values) => {
    this.props.onChangeFilters(values);

    if (this.shouldFetchRooms(this.props.filters, values)) {
      this.doFetchRooms(values);
    }
  };

  handleFormChange(formValues) {
    let room = this.state.room;
    if (formValues[c.TYPE_ROOM] !== this.state.formValues[c.TYPE_ROOM]) {
      room = {
        current: formValues[c.TYPE_ROOM],
        previous: this.state.room.current,
        exiting: this.state.room.current !== this.state.room.previous,
      };
    }
    this.setState({
      room,
      formValues,
    });
  }

  // Only fetch rooms if relevant filters have changed.
  shouldFetchRooms = (oldValues, newValues) =>
    get(oldValues, `${c.TYPE_LOCATION}.length`) !== get(newValues, `${c.TYPE_LOCATION}.length`) ||
    get(oldValues, `${c.TYPE_ROOM_TYPE}.length`) !== get(newValues, `${c.TYPE_ROOM_TYPE}.length`) ||
    oldValues[ATTENDEES] !== newValues[ATTENDEES];

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
      sort: {
        title: {
          path: 'title',
        },
      },
      replace: true,
      headers: {
        'X-Consumer-ID': interceptClient.consumer,
      },
    });
  }

  onlyAvailable = (availability) => {
    const { rooms } = availability;
    const isStaff = utils.userIsStaff();
    const conflictProp = isStaff ? 'has_reservation_conflict' : 'has_open_hours_conflict';

    return (room) => {
      const id = get(room, 'data.id');

      // If the room is not returned from the availabilty request, lets assume it's available;
      if (!rooms[id]) {
        return true;
      }

      // Return true if there is no conflict.
      return !rooms[id][conflictProp];
    };
  };

  showAvailable = (rooms) => {
    const { availability } = this.state;

    if (availability.rooms.length === 0 || availability.loading) {
      return rooms;
    }

    return rooms.filter(this.onlyAvailable(availability));
  };

  renderDetailButton = (roomProps) => {
    const { onViewRoomDetail } = this.props;

    return (
      <Button
        variant={'outlined'}
        size="small"
        color="primary"
        className={'action-button__button'}
        onClick={() => onViewRoomDetail(roomProps.uuid)}
      >
        {'View Details'}
      </Button>
    );
  };

  render() {
    const { props, handleFilterChange, handleRoomSelect } = this;
    const { rooms, roomsLoading, filters } = props;

    const roomToShow = this.state.room[this.state.room.exiting ? 'previous' : 'current'];
    const roomFooter = (roomProps) => {
      const reservable = get(roomProps, 'room.attributes.field_reservable_online');
      const staffOnly = get(roomProps, 'room.attributes.field_staff_use_only');
      const phoneNumber = get(roomProps, 'room.attributes.field_reservation_phone_number');
      let status = null;

      if (!reservable) {
        const statusText = staffOnly
          ? 'Only event organizers can reserve staff only rooms'
          : 'Only event organizers can reserve online';
        if (!utils.userIsManager()) {
          const phoneLink = phoneNumber ? (
            <a href={`tel:${phoneNumber}`} className="call-prompt__link">
              {phoneNumber}
            </a>
          ) : null;

          return (
            <p className="call-prompt">
              <span className="call-prompt__text">Call to Reserve</span> {phoneLink}
            </p>
          );
        }

        status = <p className="action-button__message">{statusText}</p>;
      }

      return (
        <div className="action-button">
          <Button
            variant={'raised'}
            size="small"
            color="primary"
            className={'action-button__button'}
            onClick={() => handleRoomSelect(roomProps.uuid)}
          >
            {'Reserve'}
          </Button>
          {this.renderDetailButton(roomProps)}
          {status}
        </div>
      );
    };

    return (
      <div className="l--sidebar-before">
        <div className="l__main">
          <div className="l__secondary">
            <RoomFilters onChange={handleFilterChange} filters={filters} />
          </div>
          <div className="l__primary">
            <PageSpinner loading={roomsLoading} />
            <RoomList
              rooms={this.showAvailable(rooms)}
              teaserProps={{ footer: roomFooter }}
              loading={roomsLoading}
            />
            {(this.state.room.previous || this.state.room.current) && (
              <Slide
                direction="up"
                in={!this.state.room.exiting}
                onExited={this.onExited}
                mountOnEnter
              >
                <RoomTeaser uuid={roomToShow} id={roomToShow} className="room-teaser" />
              </Slide>
            )}
            <LoadingIndicator loading={roomsLoading} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  rooms: select.roomsAscending(state).filter(byKeyword(ownProps.filters[c.KEYWORD])),
  roomsLoading: select.recordsAreLoading(c.TYPE_ROOM)(state),
  calendarRooms: [],
});

const mapDispatchToProps = dispatch => ({
  fetchRooms: (options) => {
    dispatch(api[c.TYPE_ROOM].fetchAll(options));
  },
  fetchLocations: (options) => {
    dispatch(api[c.TYPE_LOCATION].fetchAll(options));
  },
  fetchUser: (options) => {
    dispatch(api[c.TYPE_USER].fetchAll(options));
  },
});

ReserveRoomStep1.propTypes = {
  rooms: PropTypes.arrayOf(Object).isRequired,
  roomsLoading: PropTypes.bool.isRequired,
  fetchLocations: PropTypes.func.isRequired,
  fetchRooms: PropTypes.func.isRequired,
  fetchUser: PropTypes.func.isRequired,
  onViewRoomDetail: PropTypes.func.isRequired,
};

ReserveRoomStep1.defaultProps = {
  view: 'list',
  calView: 'month',
  date: new Date(),
  filters: {},
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReserveRoomStep1);
