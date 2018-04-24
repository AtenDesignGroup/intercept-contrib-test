//
// Date Functions
//

// Make sure the current value is a valid date object.
export const ensureDate = date => (date instanceof Date ? date : new Date(date));
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
  return moment(date).format('dddd, MMMM D, YYYY');
};

// Converts a Date object to a Drupal compatible string.
//   Trims `.000Z` off the end.
export const dateToDrupal = date => date.toISOString().replace('.000Z', '');
