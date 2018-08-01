import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import pick from 'lodash/pick';

import interceptClient from 'interceptClient';
import drupalSettings from 'drupalSettings';

// Material UI
import Slide from '@material-ui/core/Slide';

// Intercept Components

// Local Components
import ReserveRoomDateForm from './ReserveRoomDateForm';

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

class ReserveRoomStep2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      calView: props.calView,
      date: props.date,
      filters: props.filters,
      formValues: {
        [c.TYPE_ROOM]: null,
        date: new Date(),
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
    };
    this.handleCalendarNavigate = this.handleCalendarNavigate.bind(this);
    this.handleCalendarView = this.handleCalendarView.bind(this);
    // this.handleFilterChange = this.handleFilterChange.bind(this);
    // this.handleViewChange = this.handleViewChange.bind(this);
    // this.handleFormChange = this.handleFormChange.bind(this);
    // this.onExited = this.onExited.bind(this);
    // this.doFetchRooms = debounce(this.doFetchRooms, 500).bind(this);
  }

  componentDidMount() {
    // this.doFetchRooms(this.props.filters, this.props.view, this.props.calView, this.props.date);
    // this.props.fetchLocations();
  }

  handleViewChange = (value) => {
    // this.props.onChangeView(value);
    // this.doFetchRooms(this.props.filters, value, this.props.calView, this.props.date);
  };

  handleCalendarNavigate = (date, calView) => {
    this.props.onChangeDate(date);
    // this.doFetchRooms(this.props.filters, 'calendar', calView, date);
  };

  handleCalendarView = (calView) => {
    this.props.onChangeCalView(calView);
    // this.doFetchRooms(this.props.filters, 'calendar', calView, this.props.date);
  };

  handleFilterChange(values) {
    this.props.onChangeFilters(values);
    // this.doFetchRooms(values);
  }

  // handleFormChange(formValues) {
  //   this.setState({
  //     formValues,
  //   });
  // }

  render() {
    const {
      props,
      handleCalendarNavigate,
      handleViewChange,
      handleCalendarView,
      handleFilterChange,
      // handleFormChange,
    } = this;
    const {
      calendarRooms,
      rooms,
      roomsLoading,
      filters,
      view,
      date,
      calView,
      onChange,
      formValues,
      onChangeStep
    } = props;

    const values = pick(formValues, [
      'date',
      'start',
      'end',
      'meetingStart',
      'meetingEnd',
    ]);

    return (
      <div className="">
        <div className="l__main">
          <div className="l__secondary">
          </div>
          <div className="l__primary">
            <ReserveRoomDateForm
              values={values}
              onChange={onChange}
              onSubmit={() => onChangeStep(2)}
            />
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
  fetchLocations: (options) => {
    dispatch(api[c.TYPE_LOCATION].fetchAll(options));
  },
  fetchUser: (options) => {
    dispatch(api[c.TYPE_USER].fetchAll(options));
  },
});

ReserveRoomStep2.propTypes = {
  // calendarRooms: PropTypes.arrayOf(Object).isRequired,
  rooms: PropTypes.arrayOf(Object).isRequired,
  roomsLoading: PropTypes.bool.isRequired,
  fetchLocations: PropTypes.func.isRequired,
  fetchRooms: PropTypes.func.isRequired,
  fetchUser: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  // calView: PropTypes.string,
  // date: PropTypes.instanceOf(Date),
  // view: PropTypes.string,
  // filters: PropTypes.object,
  // onChangeCalView: PropTypes.func.isRequired,
  // onChangeView: PropTypes.func.isRequired,
  // onChangeFilters: PropTypes.func.isRequired,
  // onChangeDate: PropTypes.func.isRequired,
};

ReserveRoomStep2.defaultProps = {
  view: 'list',
  calView: 'month',
  date: new Date(),
  filters: {},
};

export default connect(mapStateToProps, mapDispatchToProps)(ReserveRoomStep2);
