import moment from 'moment';
import drupalSettings from 'drupalSettings';
import get from 'lodash/get';
//
// Date Functions
//

export const getUserUtcOffset = () => get(drupalSettings, 'intercept.user.utc_offset');
export const getUserTimezone = () => get(drupalSettings, 'intercept.user.timezone');
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

// Get a formatted time string.
export const getTimeDisplay = date =>
  // 2p.m.
  moment(date)
    .tz(getUserTimezone())
    .format('h:mm a')
    .replace('m', '.m.');

// Converts a Date object to a Drupal compatible string.
//   Trims `.000Z` off the end.
export const dateToDrupal = date =>
  ensureDate(date)
    .toISOString()
    .replace('.000Z', '');

// Converts a Drupal compatible string to a Date object.
export const dateFromDrupal = date =>
  moment(`${date}Z`, moment.ISO_8601)
    .toDate();
