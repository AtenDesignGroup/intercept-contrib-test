// React
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Moment
import moment from 'moment';

// Drupal
import drupalSettings from 'drupalSettings';


// Lodash
import debounce from 'lodash/debounce';

// Material UI
import CircularProgress from '@material-ui/core/CircularProgress';

// Intercept
import interceptClient from 'interceptClient';

// Intercept Components
import DialogConfirm from 'intercept/Dialog/DialogConfirm';
import ViewSwitcher from 'intercept/ViewSwitcher';

// Local Components
import EventRegistrationActions from '../EventRegistrationActions';
import EventList from '../EventList';
import EventTeaser from 'intercept/EventTeaser';

const { constants, api, select } = interceptClient;
const c = constants;

const uuid = drupalSettings.intercept.parameters.user.uuid;

const viewOptions = [{ key: 'past', value: 'Past' }, { key: 'upcoming', value: 'Upcoming' }];

function getDateFilters(tense = 'upcoming', path) {
  const operator = tense === 'past' ? '<' : '>';
  const value = moment(new Date()).toISOString();

  return {
    date: {
      path,
      value,
      operator,
    },
  };
}

class AccountEventList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.handleViewChange = this.handleViewChange.bind(this);
    this.doFetch = debounce(this.doFetch, 300).bind(this);
    this.doFetchRegistrations = this.doFetchRegistrations.bind(this);
    this.doFetchSavedEvents = this.doFetchSavedEvents.bind(this);
  }

  componentDidMount() {
    this.doFetch(this.props.view);
  }

  handleViewChange = (value) => {
    this.props.onChangeView(value);
    this.doFetch(value);
  };

  doFetchRegistrations(view) {
    this.props.fetchRegistrations({
      filters: {
        user: {
          path: 'field_user.uuid',
          value: uuid,
        },
        ...getDateFilters(view, 'field_event.field_date_time.end_value'),
      },
      include: [
        'field_event',
        'field_event.image_primary',
        'field_event.image_primary.field_media_image',
        'field_event.field_location',
      ],
      // replace: true,
      headers: {
        'X-Consumer-ID': interceptClient.consumer,
      },
    });
  }

  doFetchSavedEvents(view) {
    this.props.fetchRegistrations({
      filters: {
        user: {
          path: 'uid.uuid',
          value: uuid,
        },
        ...getDateFilters(view, 'flagged_entity.field_date_time.end_value'),
      },
      include: [
        'flagged_entity',
        'flagged_entity.image_primary',
        'flagged_entity.image_primary.field_media_image',
        'flagged_entity.field_location',
      ],
      // replace: true,
      headers: {
        'X-Consumer-ID': interceptClient.consumer,
      },
    });
  }

  doFetch(view) {
    if (this.props.showSaves) {
      this.doFetchSavedEvents(view);
    }
    if (this.props.showRegistrations) {
      this.doFetchRegistrations(view);
    }
  }

  doConfirmAction() {
    this.setState({
      open: true,
      text: 'Confirm cancel',
    });
  }

  render() {
    const { props, handleViewChange } = this;
    const { registrations, view, isLoading } = props;
    const items = Object.values(registrations).map(item => item.data.id);

    const list = items.length > 0
      ? <EventList items={items} key={0} />
      : isLoading
      ? <CircularProgress size={50} />
      : <p key={0}>No events available.</p>;

    return (
      <div className="l--main">
        <div className="l--subsection">
          <ViewSwitcher options={viewOptions} value={view} handleChange={handleViewChange} />
        </div>
        <div className="l--subsection">
          {list}
        </div>
      </div>
    );
  }
}

AccountEventList.propTypes = {
  onChangeView: PropTypes.func.isRequired,
  fetchRegistrations: PropTypes.func.isRequired,
  view: PropTypes.string,
  showSaves: PropTypes.bool,
  showRegistrations: PropTypes.bool,
};

AccountEventList.defaultProps = {
  view: 'upcoming',
  showSaves: true,
  showRegistrations: true,
};

const mapStateToProps = (state, ownProps) => {
  let selector = 'usersEvents';

  // Only show registrations if we are not showing saves.
  if (!ownProps.showSaves) {
    selector = 'eventsFromEventRegistrationsByUser';
  }

  // Only show saved events if we are not showing registrations.
  if (!ownProps.showRegistrations) {
    selector = 'eventsFromSavedEventsByUser';
  }

  return {
    events: select[selector](ownProps.uuid)(state),
    registrations: select.eventRegistrations(state),
    isLoading: select.recordsAreLoading(c.TYPE_EVENT_REGISTRATION)(state)
      || select.recordsAreLoading(c.TYPE_SAVED_EVENT)(state),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchRegistrations: (options) => {
    dispatch(api[c.TYPE_EVENT_REGISTRATION].fetchAll(options));
  },
  fetchEventSaves: (options) => {
    dispatch(api[c.TYPE_SAVED_EVENT].fetchAll(options));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountEventList);
