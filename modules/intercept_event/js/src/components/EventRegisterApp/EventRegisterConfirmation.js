import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import interceptClient from 'interceptClient';
import DialogConfirm from 'intercept/Dialog/DialogConfirm';
// import RoomReservationSummary from './RoomReservationSummary';
import EventRegistrationStatus from './EventRegistrationStatus';

const { actions, api, constants, select, utils } = interceptClient;
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
    const { open, onCancel } = this.props;
    const { saved } = this.state;

    // const content = false ? (
    //   <EventRegistrationStatus uuid={uuid} />
    // ) : null;
    const content = null;

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
};

EventRegisterConfirmation.defaultProps = {
  onConfirm: null,
  onCancel: null,
  open: false,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  save: (uuid) => {
    dispatch(api[c.TYPE_EVENT_REGISTRATION].sync(uuid));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EventRegisterConfirmation);
