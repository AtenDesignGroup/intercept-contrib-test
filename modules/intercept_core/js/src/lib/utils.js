import moment from 'moment';
import drupalSettings from 'drupalSettings';
import get from 'lodash/get';
import intersection from 'lodash/intersection';

//
// User getters
//
export const getUserUtcOffset = () => get(drupalSettings, 'intercept.user.utc_offset');
export const getUserTimezone = () => get(drupalSettings, 'intercept.user.timezone');
export const getUserUid = () => get(drupalSettings, 'intercept.user.id');
export const getUserUuid = () => get(drupalSettings, 'intercept.user.uuid');
export const getUserRoles = () => get(drupalSettings, 'intercept.user.roles');

//
// Date Functions
//
export const newUserDate = (date = new Date()) =>
  moment(date)
    .utc()
    .utcOffset(moment().utcOffset() / 60 - getUserUtcOffset(), true)
    .toDate();

// Make sure the current value is a valid date object.
export const ensureDate = (date) => {
  if (date instanceof Date) {
    return new Date(date);
  }
  if (date.toDate instanceof Function) {
    return date.toDate();
  }
  return new Date(date);
};

// Normalize a date object to a single day. Used to compare days for different dates.
export const getDayTimeStamp = date => ensureDate(date).setHours(0, 0, 0, 0);
// Get a formatted date string.
export const getDayDisplay = (date) => {
  const d = getDayTimeStamp(date);

  // Today
  if (d === getDayTimeStamp(new Date())) {
    return 'Today';
  }
  // Tommorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d === getDayTimeStamp(tomorrow)) {
    return 'Tomorrow';
  }
  // Friday, October 20, 2017
  return moment(date)
    .utcOffset(getUserUtcOffset())
    .format('dddd, MMMM D, YYYY');
};

// Get a formatted short date string.
export const getDateDisplay = (date) => {
  const d = getDayTimeStamp(date);

  // Today
  if (d === getDayTimeStamp(new Date())) {
    return 'Today';
  }
  // Tommorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d === getDayTimeStamp(tomorrow)) {
    return 'Tomorrow';
  }
  // Friday, October 20, 2017
  return moment(date)
    .utcOffset(getUserUtcOffset())
    .format('M/D/YYYY');
};

// Get a formatted time string
//   Example: '2p.m.'
export const getTimeDisplay = date =>
  // 2p.m.
  moment(date)
    .tz(getUserTimezone())
    .format('h:mm a')
    .replace('m', '.m.');

// Get a formatted time string
//   Example: '07/13/79 2p.m. to 4p.m.'
export const getDateTimespanDisplay = ({ date, start, end }) =>
  // const { date, start, end } = this.props.values;
  `${getDateDisplay(date)} ${getTimeDisplay(start)} to ${getTimeDisplay(end)}`;

// Converts a Date object to a Drupal compatible string.
//   Trims `.000Z` off the end.
export const dateToDrupal = date =>
  ensureDate(date)
    .toISOString()
    .replace('.000Z', '');

// Converts a Drupal compatible string to a Date object.
export const dateFromDrupal = date => moment(`${date}Z`, moment.ISO_8601).toDate();

export const roundTo = (date, value = 15, units = 'minutes', method = 'ceil') => {
  const duration = moment.duration(value, units);
  return moment(Math[method](+date / +duration) * +duration);
};

//
// User Functions
//

/**
 * Check if the current user is the super admin.
 * This is useful for doing permission checks agains roles because the super admin
 * has no assigned roles and only appears as 'authenticated', despite having permission
 * to do anything.
 *
 * @return {Boolean}
 *   True if the user is super admin.
 */
export const userIsSuperAdmin = () => getUserUid() === '1';

/**
 * Check if the current user has at least one of the provided roles.
 *
 * @param roles {Array}
 *   An array of one or more roles to check against.
 * @return {Boolean}
 *   True if the user has at least one of the provided roles or is a superadmin,
 *   otherwise False.
 */
export const userHasRole = roles => userIsSuperAdmin()
  || intersection(roles, getUserRoles()).length >= 1;
