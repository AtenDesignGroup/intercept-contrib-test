import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

// Lodash
import get from 'lodash/get';

/* eslint-disable */
import drupalSettings from 'drupalSettings';
import interceptClient from 'interceptClient';
import RegistrationTallySummary from 'intercept/RegistrationTallySummary';
import RegistrationStatus from 'intercept/RegistrationStatus';
/* eslint-enable */
import EventRegistrationActions from '../EventRegistrationActions';

const { constants, select } = interceptClient;
const c = constants;

const defaultUserId = get(drupalSettings, 'intercept.user.uuid');

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  lastColumn: {
    paddingRight: 0,

    '&:last-child': {
      paddingRight: 0,
    },
  },
  canceled: {
    opacity: '.6',
  }
});

const getData = registrations =>
  registrations.map((registered) => {
    return {
      id: get(registered, 'data.id'),
      status: get(registered, 'data.attributes.status'),
    };
  });

function EventRegistrationTable(props) {
  const { classes, registrations } = props;
  const data = getData(registrations);

  // const getEventAction = id => getAction(id, eventId);

  return (
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell>Registration</TableCell>
          <TableCell>Status</TableCell>
          <TableCell numeric />
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map(n => (
          <TableRow key={n.id} className={n.status === 'canceled' && classes.canceled}>
            <TableCell>
              <RegistrationTallySummary id={n.id} />
            </TableCell>
            <TableCell>{n.status}</TableCell>
            <TableCell numeric className={classes.lastColumn}>
              <EventRegistrationActions registrationId={n.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

EventRegistrationTable.propTypes = {
  eventId: PropTypes.string.isRequired,
  // Connect
  registrations: PropTypes.array,
  // withStyles
  classes: PropTypes.object.isRequired,
};

EventRegistrationTable.defaultProps = {
  registrations: [],
};

const mapStateToProps = (state, ownProps) => ({
  registrations: select.eventRegistrationsByEventByUser(
    ownProps.eventId,
    ownProps.userId || defaultUserId,
  )(state),
  registrationsLoading: select.recordsAreLoading(c.TYPE_EVENT_REGISTRATION)(state),
});

export default withStyles(styles)(connect(mapStateToProps)(EventRegistrationTable));
