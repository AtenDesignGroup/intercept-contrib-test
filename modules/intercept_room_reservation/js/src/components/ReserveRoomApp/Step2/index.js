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

const { constants, select, utils } = interceptClient;
const c = constants;

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
        max: '2400',
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
      // Open hours for current day.
      ? select.roomLocationHours(ownProps.room, ownProps.formValues.date)(state)
      // Default open hours.
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
