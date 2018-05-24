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
import EventRegistrationList from '../EventRegistrationList';
import RegistrationTeaser from '../RegistrationTeaser';

const { constants, api, select } = interceptClient;
const c = constants;

const uuid = drupalSettings.intercept.parameters.user.uuid;

const viewOptions = [{ key: 'past', value: 'Past' }, { key: 'upcoming', value: 'Upcoming' }];

function getDateFilters(tense = 'upcoming') {
  const path = 'field_event.field_date_time.end_value';
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

class AccountEventRegistrationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.handleViewChange = this.handleViewChange.bind(this);
    this.doFetch = debounce(this.doFetch, 300).bind(this);
  }

  componentDidMount() {
    this.doFetch(this.props.view);
  }

  handleViewChange = (value) => {
    this.props.onChangeView(value);
    this.doFetch(value);
  };

  doFetch(view) {
    this.props.fetchRegistrations({
      filters: {
        user: {
          path: 'field_user.uuid',
          value: uuid,
        },
        ...getDateFilters(view),
      },
      include: [
        'field_event',
        'field_event.image_primary',
        'field_event.image_primary.field_media_image',
        'field_event.field_location',
      ],
      replace: true,
      headers: {
        'X-Consumer-ID': interceptClient.consumer,
      },
    });
  }

  doConfirmAction(Param) {
    this.setState({
      open: true,
      text: 'Confirm cancel',
    });
  }

  render() {
    const { props, handleViewChange } = this;
    const { registrations, view, registrationsLoading } = props;
    const items = Object.values(registrations).map(item => item.data.id);

    const list = items.length > 0
      ? <EventRegistrationList items={items} key={0} />
      : registrationsLoading
      ? <CircularProgress size={50} />
      : <p key={0}>No registrations available.</p>;

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

AccountEventRegistrationList.propTypes = {
  onChangeView: PropTypes.func.isRequired,
  view: PropTypes.string,
};

AccountEventRegistrationList.defaultProps = {
  view: 'upcoming',
};

const mapStateToProps = state => ({
  registrations: select.eventRegistrations(state),
  registrationsLoading: select.recordsAreLoading(c.TYPE_EVENT_REGISTRATION)(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchRegistrations: (options) => {
    dispatch(api[c.TYPE_EVENT_REGISTRATION].fetchAll(options));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountEventRegistrationList);
