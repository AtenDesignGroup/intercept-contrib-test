import React from 'react';
import PropTypes from 'prop-types';
import interceptClient from 'interceptClient';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { CircularProgress } from 'material-ui/Progress';

const { constants, select } = interceptClient;
const c = constants;

const messages = {
  default: 'The status of the reservation is unknown',
  syncing: {
    requested: 'Requesting reservation',
    approved: 'Approving reservation',
    denied: 'Denying reservation',
    canceled: 'Cancelling reservation',
  },
  saved: {
    requested: 'This reservation has been requested',
    approved: 'This reservation has been approved',
    denied: 'This reservation has been denied',
    canceled: 'This reservation has been canceled',
  },
  error: {
    requested: 'An error occured while requesting this reservation',
    approved: 'An error occured while approving this reservation',
    denied: 'An error occured while denying this reservation',
    canceled: 'An error occured while cancelling this reservation',
  },
};

const getMessage = (state, status) => {
  let message = messages.default;

  if (!status) {
    return message;
  }

  if (state.syncing) {
    message = messages.syncing[status];
    return message;
  }

  if (state.error) {
    message = messages.error[status];
    return message;
  }

  if (state.saved) {
    message = messages.saved[status];
    return message;
  }

  return message;
};

const RoomReservationStatus = props => (
  <div className="room-res-status">
    <p className="room-res-status__location">
      {getMessage(props.reservation.state, get(props.reservation, 'data.attributes.field_status'))}
    </p>
    {props.reservation.state.syncing && <CircularProgress size={50} />}
  </div>
);

RoomReservationStatus.propTypes = {
  reservation: PropTypes.instanceOf(Object).isRequired,
};

const mapStateToProps = (state, ownProps) => {
  const reservationId = select.getIdentifier(c.TYPE_ROOM_RESERVATION, ownProps.uuid);
  const reservation = select.record(reservationId)(state);

  return {
    reservation,
  };
};

export default connect(mapStateToProps)(RoomReservationStatus);
