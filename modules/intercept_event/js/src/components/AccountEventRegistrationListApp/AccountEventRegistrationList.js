// React
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Drupal
import drupalSettings from 'drupalSettings';

// Material UI
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import List, { ListItem, ListItemText } from '@material-ui/core/List';

import map from 'lodash/map';
import debounce from 'lodash/debounce';

import DialogConfirm from 'intercept/Dialog/DialogConfirm';
import interceptClient from 'interceptClient';
const { constants, api, select } = interceptClient;
const c = constants;
import ContentList from 'intercept/ContentList';
import ViewSwitcher from 'intercept/ViewSwitcher';


// Local Components
import EventActionButtons from '../EventActionButtons';
import RegistrationTeaser from '../RegistrationTeaser';

const store = interceptClient.store;

const uuid = drupalSettings.intercept.parameters.user.uuid;

const viewOptions = [
  { key: 'past', value: 'Past' },
  { key: 'upcoming', value: 'Upcoming' },
]

class AccountEventRegistrationList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.handleViewChange = this.handleViewChange.bind(this);
    this.doFetch = debounce(this.doFetch, 500).bind(this);
  }

  componentDidMount() {
    this.doFetch();
  }

  handleViewChange = (value) => {
    this.props.onChangeView(value);
    this.doFetch(value);
  };

  doFetch() {
    this.props.fetchRegistrations({
      filters: {
        user: {
          path: 'field_user.uuid',
          value: uuid,
        },
      },
      include: [
        'field_event',
        'field_event.image_primary',
        'field_event.image_primary.field_media_image',
        'field_event.field_location'
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
    const {
      props,
      handleViewChange,
    } = this;
    const { registrations, view } = props;

    const teasers = items =>
      items.map(item => ({
        key: item.data.id,
        node: <RegistrationTeaser
          id={item.data.id}
          actions={
            <EventActionButtons
              id={item.data.id}
              actions={["cancel"]}
            ></EventActionButtons>
          }
          className="registrations-teaser" />
      }));

    const list =
      Object.values(registrations).length > 0 ? (
        <div>
          <ViewSwitcher options={viewOptions} value={view} handleChange={handleViewChange} />
          <ContentList
            items={teasers(Object.values(registrations))}
            key={0}
          />
        </div>
      ) : (
          <p key={0}>No registrations have been loaded.</p>
        );

    return <div className="registrations-list">{list}</div>;
  }
}

AccountEventRegistrationList.propTypes = {
  //onChangeView: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  registrations: select.eventRegistrations(state),
  registrationsLoading: select.recordsAreLoading(c.TYPE_EVENT_REGISTRATION)(state)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchRegistrations: (options) => {
    dispatch(api[c.TYPE_EVENT_REGISTRATION].fetchAll(options));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountEventRegistrationList);
