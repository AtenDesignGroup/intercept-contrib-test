import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import get from 'lodash/get';
import pick from 'lodash/pick';

import interceptClient from 'interceptClient';
import drupalSettings from 'drupalSettings';

// Material UI
import Slide from '@material-ui/core/Slide';

// Intercept Components

// Local Components
import ReserveRoomDateForm from './ReserveRoomDateForm';
// import utils from '../../../../../../../node_modules/formsy-react/lib/utils';

const { constants, api, select, utils } = interceptClient;
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
  }

  componentDidMount() {
    this.props.onChange(this.getDefaultValues());
  }

  getDefaultValues = () => {
    const { formValues, room, event, eventRecord, locationRecord, filters } = this.props;

    const values = pick(formValues, ['date', 'start', 'end', 'meetingStart', 'meetingEnd']);

    // If there's an event but it has not populated yet, hold off on default props.
    if (event && !eventRecord) {
      return values;
    }

    const isStaff = utils.userIsStaff();
    const nowish = utils.roundTo(new Date()).tz(utils.getUserTimezone());

    // @todo: Take into account location hours.
    const { duration } = filters;

    if (!values.date) {
      values.date = filters.date || utils.getUserStartOfDay();
    }

    if (!values.start) {
      values.start = nowish.format('HHmm');
    }

    if (!values.end) {
      values.end = nowish.add(duration || 30, 'minutes').format('HHmm');
    }

    return values;
  };

  render() {
    const { onChange, formValues, onChangeStep, hours } = this.props;

    const limits = utils.userIsStaff()
      ? {
        min: '0000',
        max: '2345',
      } : hours ? hours : {
        min: null,
        max: null,
      };


    return (
      <div className="l--sidebar-before">
        <div className="l__main">
          <div className="l__secondary">
            <ReserveRoomDateForm
              values={formValues}
              onChange={onChange}
              onSubmit={() => onChangeStep(2)}
              min={limits.min}
              max={limits.max}
            />
          </div>
          <div className="l__primary" />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const hours =
    ownProps.formValues.date && ownProps.room
      ? select.roomLocationHours(ownProps.room, ownProps.formValues.date)(state)
      : select.locationsOpenHoursLimit(state);

  return {
    rooms: select.roomsAscending(state),
    roomsLoading: select.recordsAreLoading(c.TYPE_ROOM)(state),
    locationRecord: ownProps.room ? select.roomLocationRecord(ownProps.room)(state) : null,
    // eventRecord: ownProps.event ? select.event(ownProps.event)(state) : null,
    hours,
    calendarRooms: [],
  };
};

ReserveRoomStep2.propTypes = {
  rooms: PropTypes.arrayOf(Object).isRequired,
  roomsLoading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onChangeRoom: PropTypes.func.isRequired,
  onChangeStep: PropTypes.func.isRequired,
  hours: PropTypes.object,
};

ReserveRoomStep2.defaultProps = {
  view: 'list',
  calView: 'month',
  date: new Date(),
  filters: {},
  hours: null,
};

export default connect(mapStateToProps)(ReserveRoomStep2);
