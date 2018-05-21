import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import get from 'lodash/get';
import Button from '@material-ui/core/Button';
import interceptClient from 'interceptClient';

const { utils } = interceptClient;

const styles = theme => ({
  button: {},
});

// open_pending: registration is not yet open
// open: registration is open and not full
// waitlist: registration is full and there is a waitlist that is not full
// full: registration is open and full and there is no waitlist or the waitlist is full
// closed: registration is closed but not expired
// expired: registration is expired

function getStatus(event) {
  return get(event, 'attributes.registration.status');
}

function getRegistrationOpenDate(event) {
  const openDate = get(event, 'attributes.field_event_register_period.value');

  if (!openDate) {
    return 'soon';
  }

  return utils.getDateDisplay(utils.dateFromDrupal(openDate));
}

function getText(event) {
  const status = getStatus(event);

  if (!status) {
    return null;
  }

  switch (status) {
    case 'open_pending':
      return `Registration Opens ${getRegistrationOpenDate(event)}`;
    case 'waitlist':
      return 'Join Waitlist';
    case 'full':
      return 'Registration is Full';
    case 'closed':
      return 'Registration is closed';
    case 'expired':
      return 'This event has expired';
    default:
      return 'register';
  }
}

function getRegisterUrl(event) {
  return `/event/${event.attributes.nid}/register`;
}

function registrationAllowed(event) {
  const status = getStatus(event);
  switch (status) {
    case 'open':
    case 'waitlist':
      return true;
    default:
      return false;
  }
}

function ButtonRegister(props) {
  const { classes, event } = props;
  const text = getText(event);

  if (registrationAllowed(event)) {
    return (
      <Button
        href={getRegisterUrl(event)}
        variant="raised"
        size="small"
        color="primary"
        className={classes.button}
      >
        {text}
      </Button>
    );
  }

  return <p>{text}</p>;
}

ButtonRegister.propTypes = {
  classes: PropTypes.object.isRequired,
  event: PropTypes.object.isRequired,
};

export default withStyles(styles)(ButtonRegister);
