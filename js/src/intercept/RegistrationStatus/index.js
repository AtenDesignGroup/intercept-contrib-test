import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import interceptClient from 'interceptClient';

const { utils } = interceptClient;

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

function getText(event, registrations) {
  const mustRegister = getMustRegister(event);
  const status = getStatus(event);
  const userStatus = registrations.length > 0
    ? get(registrations[0], 'data.attributes.status')
    : null;

  if (!status || !mustRegister) {
    return null;
  }

  if (userStatus === 'active') {
    return 'You are Registered!';
  }

  if (userStatus === 'waitlist') {
    return 'You are on the waitlist';
  }

  switch (status) {
    case 'open_pending':
      return `Registration Opens ${getRegistrationOpenDate(event)}`;
    case 'waitlist':
      return 'On a Waitlist';
    case 'full':
      return 'Registration is Full';
    case 'closed':
      return 'Registration is closed';
    case 'expired':
      return 'This event has ended';
    default:
      return null;
  }
}

function RegistrationStatus(props) {
  const { event, registrations } = props;
  const text = getText(event, registrations);

  return text ? <p className="action-button__message">{text}</p> : null;
}

RegistrationStatus.propTypes = {
  event: PropTypes.object.isRequired,
  registrations: PropTypes.array,
};

RegistrationStatus.defaultProps = {
  registrations: [],
};

export default RegistrationStatus;
