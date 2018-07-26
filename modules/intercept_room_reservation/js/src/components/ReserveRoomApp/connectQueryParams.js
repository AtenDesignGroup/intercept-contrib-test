// React URL Query
import { addUrlProps, UrlQueryParamTypes, encode, decode, Serialize } from 'react-url-query';

// Lodash
import pickBy from 'lodash/pickBy';

/* eslint-disable */
import interceptClient from 'interceptClient';
import updateWithHistory from 'intercept/updateWithHistory';
/* eslint-enable */

const { decodeArray, encodeArray, decodeObject, encodeObject } = Serialize;

const { constants } = interceptClient;
const c = constants;
const ATTENDEES = 'attendees';

const removeFalseyProps = obj => pickBy(obj, prop => prop);

const encodeFilters = (value) => {
  const filters = removeFalseyProps({
    location: encodeArray(value[c.TYPE_LOCATION], ','),
    type: encodeArray(value[c.TYPE_ROOM_TYPE], ','),
    attendees: encode(UrlQueryParamTypes.number, value[ATTENDEES]),
    // [c.DATE]: !value[c.DATE] ? null : encode(UrlQueryParamTypes.date, value[c.DATE]),
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
    // [c.DATE]: decode(UrlQueryParamTypes.date, value[c.DATE]) || null,
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
  // date: { type: UrlQueryParamTypes.date },
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
