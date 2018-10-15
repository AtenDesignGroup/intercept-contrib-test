import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import interceptClient from 'interceptClient';
import DialogConfirm from 'intercept/Dialog/DialogConfirm';
import RoomReservationSummary from './RoomReservationSummary';
import RoomReservationStatus from './RoomReservationStatus';
import get from 'lodash/get';

const { actions, api, constants, select, utils, session } = interceptClient;
const c = constants;
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
    const { onConfirm, save } = this.props;
    const uuid = onConfirm();
    save(uuid);
    this.setState({ saved: true, uuid });
  }

  render() {
    const { open, onCancel, values, eventNid } = this.props;
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

    if (uuid && eventNid) {
      dialogProps.confirmText = 'Back to Edit Event';
      dialogProps.onConfirm = () => {
        window.location.href = `/node/${eventNid}/edit`;
      };
    }

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
  eventNid: PropTypes.number,
};

ReserveRoomConfirmation.defaultProps = {
  onConfirm: null,
  onCancel: null,
  open: false,
  eventNid: null,
};

const mapStateToProps = (state, ownProps) => {
  const { values } = ownProps;
  const eventId = values[c.TYPE_EVENT];
  let eventNid = null;

  if (eventId) {
    eventNid = get(select.event(values[c.TYPE_EVENT])(state), 'data.attributes.nid');
  }

  return {
    eventNid,
  };
};

const mapDispatchToProps = dispatch => ({
  save: (uuid) => {
    // dispatch(actions.add(data, c.TYPE_ROOM_RESERVATION, data.id));
    session
      .getToken()
      .then((token) => {
        dispatch(api[c.TYPE_ROOM_RESERVATION].sync(uuid, {
          endpoint: '/api/rooms/reserve',
          headers: { 'X-CSRF-Token': token }
        }));
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
