import React from 'react';
import PropTypes from 'prop-types';
import DialogConfirm from 'intercept/Dialog/DialogConfirm';

class ReserveRoomConfirmation extends React.PureComponent {
  render() {
    const { open, onConfirm, onCancel, values } = this.props;
    return (
      <DialogConfirm
        confirmText={'Submit'}
        cancelText={'Cancel'}
        heading={'Confirm Reservation Request?'}
        onConfirm={onConfirm}
        onCancel={onCancel}
        open={open}
      >
        {`${values.date.getTime()} ${values.start.getHours()} ${values.end.getHours()}`}
      </DialogConfirm>
    );
  }
}

ReserveRoomConfirmation.propTypes = {
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  open: PropTypes.bool,
  values: PropTypes.object.isRequired,
};

ReserveRoomConfirmation.defaultProps = {
  onConfirm: null,
  onCancel: null,
  open: false,
};

export default ReserveRoomConfirmation;
