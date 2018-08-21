import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import interceptClient from 'interceptClient';
import DialogConfirm from 'intercept/Dialog/DialogConfirm';
import RoomReservationSummary from './RoomReservationSummary';
import RoomReservationStatus from './RoomReservationStatus';

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
    // const { onConfirm, values, save } = this.props;
    // const entity = buildRoomReservation(values);
    // this.setState({
    //   saved: true,
    //   uuid: entity.id,
    // });
    // save(entity);
    // onConfirm();

    const { onConfirm, save } = this.props;
    const uuid = onConfirm();
    save(uuid);
    this.setState({ saved: true, uuid });
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
  save: (uuid) => {
    // dispatch(actions.add(data, c.TYPE_ROOM_RESERVATION, data.id));
    session
      .getToken()
      .then((token) => {
        dispatch(
          api[c.TYPE_ROOM_RESERVATION].sync(uuid, { headers: { 'X-CSRF-Token': token } }),
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
