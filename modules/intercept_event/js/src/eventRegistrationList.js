import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import DialogConfirm from 'intercept/Dialog/DialogConfirm';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormControlLabel } from 'material-ui/Form';
import map from 'lodash/map';
import debounce from 'lodash/debounce';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import interceptClient from 'interceptClient';
const { constants, api, select } = interceptClient;
const c = constants;
import ContentList from 'intercept/ContentList';
import ViewSwitcher from 'intercept/ViewSwitcher';
import { connect } from 'react-redux';
import RegistrationTeaser from './components/RegistrationTeaser';
import ButtonActions from 'intercept/ButtonActions';
import drupalSettings from 'drupalSettings';

const store = interceptClient.store;

const uuid = drupalSettings.intercept.parameters.user.uuid;

const mapStateToProps = state => ({
  registrations: select.eventRegistrations(state),
  registrationsLoading: select.recordsAreLoading(c.TYPE_EVENT_REGISTRATION)(state)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchRegistrations: (options) => {
    dispatch(api[c.TYPE_EVENT_REGISTRATION].fetchAll(options));
  }
});

class AccountEventRegistrations extends Component {

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


  doConfirmAction (Param) {
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
    const { registrations } = props;
    const view = 'past';

    const teasers = items =>
      items.map(item => ({
        key: item.data.id,
        node: <RegistrationTeaser 
          id={item.data.id}
          actions={
            <ButtonActions
              id={item.data.id}
              actions={["cancel"]}
            ></ButtonActions>
          }
          className="registrations-teaser" />
      }));

    const list =
      Object.values(registrations).length > 0 ? (
        <div>
          <ViewSwitcher value={view} handleChange={handleViewChange} />
          <ContentList
            items={teasers(Object.values(registrations))}
            key={0}
          />
          <DialogConfirm
            open={this.state.open}
            onClose={this.onDialogClose}
            onConfirm={this.onDialogConfirm}
            onCancel={this.onDialogCancel}
            text={this.state.text}
          />
        </div>
      ) : (
        <p key={0}>No registrations have been loaded.</p>
      );

    return <div className="registrations-list">{list}</div>;
  }
}

AccountEventRegistrations.propTypes = {
  onChangeView: PropTypes.func.isRequired,
}

const AccountEventRegistrationsStore = connect(mapStateToProps, mapDispatchToProps)(AccountEventRegistrations);

render(
  <Provider store={store}>
    <AccountEventRegistrationsStore />
  </Provider>,
  document.getElementById('eventRegistrationRoot'),
);
