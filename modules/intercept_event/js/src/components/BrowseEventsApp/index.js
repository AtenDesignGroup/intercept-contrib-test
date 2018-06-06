import React from 'react';
import PropTypes from 'prop-types';
import { addUrlProps, UrlQueryParamTypes, encode, decode, Serialize } from 'react-url-query';

import pickBy from 'lodash/pickBy';

import interceptClient from 'interceptClient';
import updateWithHistory from 'intercept/updateWithHistory';

import BrowseEvents from './../BrowseEvents';

const { decodeArray, encodeArray, decodeObject, encodeObject } = Serialize;

const { constants } = interceptClient;
const c = constants;

const removeFalseyProps = obj => pickBy(obj, prop => prop);

const encodeFilters = (value) => {
  const filters = removeFalseyProps({
    [c.KEYWORD]: encode(UrlQueryParamTypes.string, value[c.KEYWORD], ''),
    location: encodeArray(value[c.TYPE_LOCATION], ','),
    type: encodeArray(value[c.TYPE_EVENT_TYPE], ','),
    audience: encodeArray(value[c.TYPE_AUDIENCE], ','),
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
    [c.KEYWORD]: decode(UrlQueryParamTypes.string, value[c.KEYWORD], ''),
    [c.TYPE_LOCATION]: decodeArray(value.location, ',') || [],
    [c.TYPE_EVENT_TYPE]: decodeArray(value.type, ',') || [],
    [c.TYPE_AUDIENCE]: decodeArray(value.audience, ',') || [],
    [c.DATE]: decode(UrlQueryParamTypes.date, value[c.DATE]) || null,
  };
  return filters;
};

const urlPropsQueryConfig = {
  view: { type: UrlQueryParamTypes.string },
  calView: { type: UrlQueryParamTypes.string },
  date: { type: UrlQueryParamTypes.date },
  filters: {
    type: {
      decode: decodeFilters,
      encode: encodeFilters,
    },
  },
};

const BrowseEventsApp = props => <BrowseEvents {...props} />;

BrowseEventsApp.propTypes = {
  calView: PropTypes.string,
  date: PropTypes.instanceOf(Date),
  view: PropTypes.string,
  filters: PropTypes.object,
  onChangeCalView: PropTypes.func.isRequired,
  onChangeView: PropTypes.func.isRequired,
  onChangeFilters: PropTypes.func.isRequired,
  onChangeDate: PropTypes.func.isRequired,
};

BrowseEventsApp.defaultProps = {
  view: 'list',
  calView: 'month',
  date: new Date(),
  filters: {},
};

export default updateWithHistory(
  addUrlProps({ urlPropsQueryConfig })(BrowseEventsApp)
);
