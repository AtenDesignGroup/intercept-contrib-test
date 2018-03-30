import { createSelector } from 'reselect';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import intercept from 'intercept-client';

export const getIdentifier = (type, id) => ({
  type,
  id,
});

/**
 * Returns an array of published records.
 *
 * @param {function} selector
 *  A records selector.
 * @returns {array}
 *  An array of published records.
 */
export const published = selector =>
  createSelector(selector, items =>
    pickBy(items, item => get(item, 'data.attributes.status') === '1'),
  );

export const peek = (selector, path) =>
  createSelector(selector, items => mapValues(items, item => get(item, path)));

export const keyValues = (selector, path) =>
  createSelector(selector, items =>
    map(items, (item, key) => ({
      key,
      value: get(item, path),
    })),
  );

export const record = identifier => state => state[identifier.type].items[identifier.id];

export const records = resource => state => state[resource].items;

export const recordIds = selector =>
  createSelector(selector, items => map(items, item => get(item, 'data.id')));

export const recordIsLoading = (type, id) =>
  createSelector(record(getIdentifier(type, id)), item => item.state.syncing);

export const recordsAreLoading = resource => state => state[resource].syncing;

export const bundle = identifier => (state) => {
  if (identifier.type in state === false) {
    return identifier;
  }

  const base = record(identifier)(state);

  // Just return an id if no record is found.
  // @todo This should probably be handled better and a warning or exception thrown
  //  as it could result in unintended side effects.
  if (!base) {
    return identifier;
  }

  const entity = Object.assign({}, base).data;
  forEach(base.data.relationships, (resourceIdentifier, rel) => {
    if (!resourceIdentifier.data) {
      return;
    }
    const relData = entity.relationships[rel].data;
    // Replace the uuid with the entity object.
    entity.relationships[rel] = Array.isArray(relData)
      ? relData.map(item => bundle(item)(state))
      : bundle(relData)(state);
  });
  return entity;
};

export const bundles = type => state =>
  mapValues(records(type)(state), (value, id) => bundle(getIdentifier(type, id))(state));

//
// Events
//
export const event = id => state => state['node--event'].items[id];
export const events = state => state['node--event'].items;
export const eventIds = recordIds(events);
export const eventsOptions = keyValues(events, 'title');
export const eventsLabels = peek(events, 'data.attributes.title');
export const calendarEvents = createSelector(
  events,
  items => map(items, item => item),
  // map(items, item => ({
  //   id: item.data.uuid,
  //   title: item.data.title,
  //   startDate: new Date(new Date(2018, 3, 12, 12, 0, 0, 0)),
  //   // start: new Date(item.data['field_date_time'].value),
  //   // end: new Date(item.data['field_date_time'].end_value),
  //   endDate: new Date(2018, 3, 12, 13, 0, 0, 0),
  // })),
);
export const eventImage = id =>
  createSelector(bundle(getIdentifier('node--event', id)), resourceBundle =>
    get(resourceBundle, 'relationships.field_image_primary.relationships.field_media_image'),
  );

export const eventImageStyle = (id, style) =>
  createSelector(eventImage(id), resourceBundle =>
    get(resourceBundle, `meta.derivatives.${style}`),
  );

export const eventTeasers = createSelector(
  events,
  items => map(items, item => item),
  // map(items, item => ({
  //   id: item.data.uuid,
  //   title: item.data.title,
  //   startDate: new Date(new Date(2018, 3, 12, 12, 0, 0, 0)),
  //   // start: new Date(item.data['field_date_time'].value),
  //   // end: new Date(item.data['field_date_time'].end_value),
  //   endDate: new Date(2018, 3, 12, 13, 0, 0, 0),
  // })),
);

//
// Locations
//
export const location = id => state => state['node--location'].items[id];
export const locations = state => state['node--location'].items;
export const locationsOptions = keyValues(locations, 'data.attributes.title');
export const locationsLabels = peek(locations, 'data.attributes.title');

//
// Audience
//
export const audience = id => record('taxonomy_term--audience', id);
export const audiences = records('taxonomy_term--audience');
export const audiencesOptions = keyValues(audiences, 'data.attributes.name');
export const audiencesLabels = peek(audiences, 'data.attributes.name');

//
// Event Types
//
export const eventType = id => record('taxonomy_term--event_type', id);
export const eventTypes = records('taxonomy_term--event_type');
export const eventTypesOptions = keyValues(eventTypes, 'data.attributes.name');
export const eventTypesLabels = peek(eventTypes, 'data.attributes.name');

//
// Tag
//
export const tag = id => record('taxonomy_term--tag', id);
export const tags = records('taxonomy_term--tag');
export const tagsOptions = keyValues(tags, 'data.attributes.name');
export const tagsLabels = peek(tags, 'data.attributes.name');
