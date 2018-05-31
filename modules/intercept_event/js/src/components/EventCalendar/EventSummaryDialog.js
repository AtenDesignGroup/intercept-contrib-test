/* eslint-disable react/no-multi-comp */

import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import EventSummary from 'intercept/EventSummary';
import EventSummaryActions from './EventSummaryActions';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    overflowY: 'auto',
  },
  footer: {
    margin: 0,
  },
});

class EventSummaryDialog extends React.Component {
  render() {
    const { classes, close, onClose, open, id } = this.props;

    return (
      <Dialog close={close} onClose={onClose} open={open} keepMounted>
        <div className={classes.main}>
          {id ? <EventSummary id={id} /> : <div />}
        </div>
        <div className={classes.footer}>
        <EventSummaryActions id={id} />
        </div>
      </Dialog>
    );
  }
}

EventSummaryDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  id: PropTypes.string,
};

EventSummaryDialog.defaultProps = {
  open: false,
  onClose: null,
  id: null,
};

export default withStyles(styles)(EventSummaryDialog);
