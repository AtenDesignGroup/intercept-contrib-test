import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

// Lodash
import get from 'lodash/get';

/* eslint-disable */
import interceptClient from 'interceptClient';
import RegistrationTallySummary from 'intercept/RegistrationTallySummary';
import RegistrationStatus from 'intercept/RegistrationStatus';
/* eslint-enable */

import EventRegistrationActions from './../EventRegistrationActions';

const c = interceptClient.constants;

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
});

const getData = (registrations) => {
  return registrations.map((registered) => {
    const id = get(registered, 'data.id');
    return {
      id,
      registered,
    };
  });
};

const getRegistered = item => (
  <RegistrationTallySummary
    key={get(item, 'data.id')}
    id={get(item, 'data.id')}
  />
);

const getAction = (registration, event) => (
  event
    ? (<React.Fragment key={registration.data.id}>
      <EventRegistrationActions id={registration.data.id} />
      {registration.data.status === 'canceled'
       ? <p>Canceled</p>
       : <RegistrationStatus event={event.data} />}
    </React.Fragment>)
    : null
);

function EventRegistrationTable(props) {
  const { classes, registrations, event } = props;
  const data = getData(registrations);

  const getEventAction = id => getAction(id, event);

  return (
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell>Registration</TableCell>
          <TableCell numeric>Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map(n => (
          <TableRow key={n.id}>
            <TableCell>{getRegistered(n.registered) || null}</TableCell>
            <TableCell numeric>{getEventAction(n.registered) || null}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

EventRegistrationTable.propTypes = {
  classes: PropTypes.object.isRequired,
  event: PropTypes.object,
  registrations: PropTypes.array,
};

EventRegistrationTable.defaultProps = {
  registrations: [],
  event: null,
};

export default withStyles(styles)(EventRegistrationTable);
