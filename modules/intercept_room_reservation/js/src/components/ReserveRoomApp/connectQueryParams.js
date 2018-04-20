import { addUrlProps, UrlQueryParamTypes, encode, decode, Serialize } from 'react-url-query';

import pickBy from 'lodash/pickBy';

import interceptClient from 'interceptClient';
import updateWithHistory from 'intercept/updateWithHistory';


const { decodeArray, encodeArray, decodeObject, encodeObject } = Serialize;

const { constants } = interceptClient;
const c = constants;

const removeFalseyProps = obj => pickBy(obj, prop => prop);

const encodeFilters = (value) => {
  const filters = removeFalseyProps({
    location: encodeArray(value[c.TYPE_LOCATION], ','),
    type: encodeArray(value[c.TYPE_ROOM_TYPE], ','),
    [c.DATE]: !value[c.DATE] ? null : encode(UrlQueryParamTypes.date, value[c.DATE]),
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
    [c.DATE]: decode(UrlQueryParamTypes.date, value[c.DATE]) || null,
  };
  return filters;
};

const urlPropsQueryConfig = {
  // view: { type: UrlQueryParamTypes.string },
  // calView: { type: UrlQueryParamTypes.string },
  // date: { type: UrlQueryParamTypes.date },
  // filters: {
  //   type: {
  //     decode: decodeFilters,
  //     encode: encodeFilters,
  //   },
  // },
};

const connectQueryParams = component => updateWithHistory(
  addUrlProps({ urlPropsQueryConfig })(component)
);
export default connectQueryParams;
