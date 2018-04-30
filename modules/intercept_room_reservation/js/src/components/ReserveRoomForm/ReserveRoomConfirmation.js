import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import v4 from 'uuid/v4';
import interceptClient from 'interceptClient';
import DialogConfirm from 'intercept/Dialog/DialogConfirm';
import RoomReservationSummary from './RoomReservationSummary';

const { actions, api, constants, select, utils } = interceptClient;
const c = constants;
const buildRoomReservation = (values) => {
  const uuid = v4();

  const output = {
    id: uuid,
    type: c.TYPE_ROOM_RESERVATION,
    attributes: {
      uuid,
      field_attendee_count: values.attendees,
      field_dates: {
        value: utils.dateToDrupal(values.start),
        end_value: utils.dateToDrupal(values.end),
      },
      field_group_name: values.groupName,
      // field_meeting_dates: {
      //   value: null,
      //   end_value: null
      // },
      field_refreshments: values.refreshments,
      field_refreshments_description: {
        value: values.refreshmentsDesc,
        // format: "basic_html"
      },
      field_status: 'requested',
    },
    relationships: {
      field_event: {
        data: null,
      },
      field_room: {
        data: {
          type: c.TYPE_ROOM,
          id: values[c.TYPE_ROOM],
        },
      },
      field_user: {
        data: {
          type: c.TYPE_USER,
          id: values.user,
        },
      },
    },
  };
  return output;
};

class ReserveRoomConfirmation extends React.PureComponent {
  render() {
    const { open, onConfirm, onCancel, values, save } = this.props;

    const handleConfirm = () => {
      save(buildRoomReservation(values));
      onConfirm();
    };

    return (
      <DialogConfirm
        confirmText={'Submit'}
        cancelText={'Cancel'}
        heading={'Confirm Reservation Request?'}
        onConfirm={handleConfirm}
        onCancel={onCancel}
        open={open}
      >
        <RoomReservationSummary {...values} />
      </DialogConfirm>
    );
  }
}

ReserveRoomConfirmation.propTypes = {
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  open: PropTypes.bool,
  save: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
};

ReserveRoomConfirmation.defaultProps = {
  onConfirm: null,
  onCancel: null,
  open: false,
};

const mapStateToProps = state => ({
  // events: select.eventsByDateAscending(state),
  // eventsLoading: select.recordsAreLoading(c.TYPE_ROOM_RESERVATION)(state),
  // calendarEvents: select.calendarEvents(state),
});

const mapDispatchToProps = dispatch => ({
  save: (data) => {
    dispatch(actions.add(data, c.TYPE_ROOM_RESERVATION, data.id));
    dispatch(api[c.TYPE_ROOM_RESERVATION].sync(data.id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ReserveRoomConfirmation);
