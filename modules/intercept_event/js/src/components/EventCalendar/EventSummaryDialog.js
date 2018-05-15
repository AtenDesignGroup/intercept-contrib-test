/* eslint-disable react/no-multi-comp */

import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import EventSummary from 'intercept/EventSummary';

class EventSummaryDialog extends React.Component {
  render() {
    const { close, onClose, open, id } = this.props;

    return (
      <Dialog close={close} onClose={onClose} open={open} keepMounted>
        {id ? <EventSummary id={id} /> : <div/>}
      </Dialog>
    );
  }
}

EventSummaryDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  id: PropTypes.string,
};

EventSummaryDialog.defaultProps = {
  open: false,
  onClose: null,
  id: null,
};

export default EventSummaryDialog;
