import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import v4 from 'uuid/v4';
import interceptClient from 'interceptClient';
import DialogConfirm from 'intercept/Dialog/DialogConfirm';
import RoomReservationSummary from './RoomReservationSummary';
import RoomReservationStatus from './RoomReservationStatus';

const { actions, api, constants, select, utils, session } = interceptClient;
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
        value: utils.dateToDrupal(utils.getDateFromTime(values.start, values.date)),
        end_value: utils.dateToDrupal(utils.getDateFromTime(values.end, values.date)),
      },
      field_group_name: values.groupName,
      field_meeting_dates: {
        value: values.meetingStart ? utils.dateToDrupal(utils.getDateFromTime(values.meetingStart, values.date)) : null,
        end_value: values.meetingEnd ? utils.dateToDrupal(utils.getDateFromTime(values.meetingEnd, values.date)) : null,
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
        data: values[c.TYPE_MEETING_PURPOSE]
          ? {
            type: c.TYPE_MEETING_PURPOSE,
            id: values[c.TYPE_MEETING_PURPOSE],
          }
          : null,
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
  constructor(props) {
    super(props);

    this.state = {
      uuid: null,
      saved: false,
    };

    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleConfirm() {
    const { onConfirm, values, save } = this.props;
    const entity = buildRoomReservation(values);
    this.setState({
      saved: true,
      uuid: entity.id,
    });
    save(entity);
    onConfirm();
  }

  render() {
    const { open, onCancel, values } = this.props;
    const { uuid, saved } = this.state;

    const content =
      uuid && saved ? (
        <RoomReservationStatus uuid={uuid} />
      ) : (
        <RoomReservationSummary {...values} />
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

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  save: (data) => {
    dispatch(actions.add(data, c.TYPE_ROOM_RESERVATION, data.id));
    session
      .getToken()
      .then((token) => {
        dispatch(
          api[c.TYPE_ROOM_RESERVATION].sync(data.id, { headers: { 'X-CSRF-Token': token } }),
        );
      })
      .catch((e) => {
        console.log('Unable to save Reservation', e);
      });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReserveRoomConfirmation);
