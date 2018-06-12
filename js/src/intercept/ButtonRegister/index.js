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

function getMustRegister(event) {
  return get(event, 'attributes.field_must_register');
}

function getStatus(event) {
  return get(event, 'attributes.registration.status');
}

function getStatusUser(event) {
  return get(event, 'attributes.registration.status_user');
}

function getRegistrationOpenDate(event) {
  const openDate = get(event, 'attributes.field_event_register_period.value');

  if (!openDate) {
    return 'soon';
  }

  return utils.getDateDisplay(utils.dateFromDrupal(openDate));
}

function getText(event) {
  const mustRegister = getMustRegister(event);
  const status = getStatus(event);

  if (!status || !mustRegister) {
    return null;
  }

  switch (status) {
    case 'waitlist':
      return 'Join Waitlist';
    default:
      return 'register';
  }
}

function getRegisterUrl(event) {
  return `/event/${event.attributes.nid}/register`;
}

function registrationAllowed(event, registrations) {
  const mustRegister = getMustRegister(event);
  // const userStatus = getStatusUser(event);
  const userStatus = registrations.length > 0
    ? get(registrations[0], 'data.attributes.status')
    : null;

  // @todo: Reinstate this once we can reliably determine whether or not a user can register.
  // if (userStatus !== 'available') {
  //   return false;
  // }
  if (['active', 'waitlist'].indexOf(userStatus) >= 0) {
    return false;
  }

  if (!mustRegister) {
    return false;
  }

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
  const { classes, event, registrations } = props;
  const text = getText(event);

  return getMustRegister(event) ? (
    <Button
      href={getRegisterUrl(event)}
      variant="raised"
      size="small"
      color="primary"
      className={'action-button__button'}
      disabled={!registrationAllowed(event, registrations)}
    >
      {text}
    </Button>
  ) : null;
}

ButtonRegister.propTypes = {
  classes: PropTypes.object.isRequired,
  event: PropTypes.object.isRequired,
  registrations: PropTypes.array,
};

ButtonRegister.defaultProps = {
  registrations: [],
};

export default withStyles(styles)(ButtonRegister);
