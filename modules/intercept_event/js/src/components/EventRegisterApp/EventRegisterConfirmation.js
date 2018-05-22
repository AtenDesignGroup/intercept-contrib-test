import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import interceptClient from 'interceptClient';
import DialogConfirm from 'intercept/Dialog/DialogConfirm';
// import RoomReservationSummary from './RoomReservationSummary';
import EventRegistrationStatus from './EventRegistrationStatus';

const { actions, api, constants, session } = interceptClient;
const c = constants;

class EventRegisterConfirmation extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      saved: false,
    };

    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleConfirm() {
    const { onConfirm, save } = this.props;
    const uuid = onConfirm();
    save(uuid);
    this.setState({ saved: true });
  }

  render() {
    const { open, onCancel, uuid } = this.props;
    const { saved } = this.state;

    const dialogProps = saved
      ? {
        confirmText: null,
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
        heading: 'Confirm Registration',
        onConfirm: this.handleConfirm,
        onCancel,
      };

    return (
      <DialogConfirm {...dialogProps} open={open}>
        {uuid ? <EventRegistrationStatus uuid={uuid} /> : null}
      </DialogConfirm>
    );
  }
}

EventRegisterConfirmation.propTypes = {
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  open: PropTypes.bool,
  save: PropTypes.func.isRequired,
  uuid: PropTypes.string,
};

EventRegisterConfirmation.defaultProps = {
  onConfirm: null,
  onCancel: null,
  open: false,
  uuid: null,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  save: (uuid) => {
    session
      .getToken()
      .then((token) => {
        dispatch(
          api[c.TYPE_EVENT_REGISTRATION].sync(uuid, { headers: { 'X-CSRF-Token': token } }),
        );
      })
      .catch((e) => {
        console.log('Unable to save Registration', e);
      });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EventRegisterConfirmation);
