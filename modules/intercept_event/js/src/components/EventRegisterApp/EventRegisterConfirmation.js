import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import v4 from 'uuid/v4';
import interceptClient from 'interceptClient';
import DialogConfirm from 'intercept/Dialog/DialogConfirm';
// import RoomReservationSummary from './RoomReservationSummary';
// import RoomReservationStatus from './RoomReservationStatus';

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
      field_meeting_dates: {
        value: utils.dateToDrupal(values.meetingStart),
        end_value: utils.dateToDrupal(values.meetingEnd),
      },
      field_meeting_purpose_details: values.meetingDetails,
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
      field_meeting_purpose: {
        data: values[c.TYPE_MEETING_PURPOSE] ? {
          type: c.TYPE_MEETING_PURPOSE,
          id: values[c.TYPE_MEETING_PURPOSE],
        } : null,
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

class EventRegisterConfirmation extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      uuid: null,
    };

    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleConfirm() {
    const { onConfirm, values, save } = this.props;
    const entity = buildRoomReservation(values);
    this.setState({
      uuid: entity.id,
    });
    save(entity);
    // onConfirm();
  }

  render() {
    const { open, onCancel, values } = this.props;
    const { uuid } = this.state;

    const content = uuid ? (
      null
      // <RoomReservationStatus uuid={uuid} />
    ) : (
      // <RoomReservationSummary {...values} />
      null
    );

    const dialogProps = uuid
      ? {
        confirmText: 'View Your Reservations',
        cancelText: 'Close',
        heading: '',
        onConfirm: () => {
          window.location.href = '/account/room-reservations';
        },
        onCancel,
      }
      : {
        confirmText: 'Submit',
        cancelText: 'Cancel',
        heading: 'Confirm Reservation Request?',
        onConfirm: this.handleConfirm,
        onCancel,
      };

    return (
      <DialogConfirm {...dialogProps} open={open}>
        {content}
      </DialogConfirm>
    );
  }
}

EventRegisterConfirmation.propTypes = {
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  open: PropTypes.bool,
  save: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
};

EventRegisterConfirmation.defaultProps = {
  onConfirm: null,
  onCancel: null,
  open: false,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  save: (data) => {
    dispatch(actions.add(data, c.TYPE_ROOM_RESERVATION, data.id));
    dispatch(api[c.TYPE_ROOM_RESERVATION].sync(data.id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EventRegisterConfirmation);
