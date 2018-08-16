// React URL Query
import { addUrlProps, UrlQueryParamTypes, encode, decode, Serialize } from 'react-url-query';

// Lodash
import pickBy from 'lodash/pickBy';
import moment from 'moment';

/* eslint-disable */
import interceptClient from 'interceptClient';
import updateWithHistory from 'intercept/updateWithHistory';
/* eslint-enable */

const {
  decodeArray,
  encodeArray,
  decodeObject,
  encodeObject,
  decodeString,
  encodeString,
} = Serialize;

const { constants, utils } = interceptClient;
const c = constants;
const ATTENDEES = 'attendees';
const TIME = 'time';
const DURATION = 'duration';

const removeFalseyProps = obj => pickBy(obj, prop => prop);

const decodeDate = value =>
  // const date = decode(UrlQueryParamTypes.date, value) || null;

  // if (date === null) {
  //   return date;
  // }

  moment.tz(value, utils.getUserTimezone()).toDate() || null
;

const encodeDate = value =>
  // const date = decode(UrlQueryParamTypes.date, value) || null;

  // if (date === null) {
  //   return date;
  // }

  (
    moment(value)
      .tz(utils.getUserTimezone())
      .format('YYYY-MM-DD') || null
  )
;

const encodeFilters = (value) => {
  const filters = removeFalseyProps({
    location: encodeArray(value[c.TYPE_LOCATION], ','),
    type: encodeArray(value[c.TYPE_ROOM_TYPE], ','),
    attendees: encode(UrlQueryParamTypes.number, value[ATTENDEES]),
    [c.DATE]: !value[c.DATE] ? null : encodeDate(value[c.DATE]),
    [TIME]: encodeString(value.time),
    [DURATION]: encodeString(value.duration),
  });
  return encodeObject(filters, ':', '_');
};

const decodeFilters = (values) => {
  if (!values) {
    return {};
  }
  const value = decodeObject(values, ':', '_');
  const filters = {
    [c.TYPE_LOCATION]: decodeArray(value.location, ',') || [],
    [c.TYPE_ROOM_TYPE]: decodeArray(value.type, ',') || [],
    [ATTENDEES]: decode(UrlQueryParamTypes.number, value.attendees),
    [c.DATE]: decodeDate(value[c.DATE]),
    [TIME]: decodeString(value.time),
    [DURATION]: decodeString(value.duration),
  };
  return filters;
};

// Items for URL
// - steps
// - room
// - date
// - location
// - time/day
// - # attendees

const urlPropsQueryConfig = {
  // Active Step
  step: { type: UrlQueryParamTypes.number },
  // Selected Room
  room: { type: UrlQueryParamTypes.string },
  // Event
  event: { type: UrlQueryParamTypes.string },
  filters: {
    type: {
      decode: decodeFilters,
      encode: encodeFilters,
    },
  },
};

const connectQueryParams = component =>
  updateWithHistory(addUrlProps({ urlPropsQueryConfig })(component));
export default connectQueryParams;
