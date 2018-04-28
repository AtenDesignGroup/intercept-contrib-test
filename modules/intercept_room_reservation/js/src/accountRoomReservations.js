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
import { connect } from 'react-redux';
import ReservationTeaser from './components/ReservationTeaser';
import ButtonActions from 'intercept/ButtonActions';

const store = interceptClient.store;

const mapStateToProps = state => ({
  reservations: select.roomReservations(state),
  reservationsLoading: select.recordsAreLoading(c.TYPE_ROOM_RESERVATION)(state)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchReservations: (options) => {
    dispatch(api[c.TYPE_ROOM_RESERVATION].fetchAll(options));
  }
});

class AccountRoomReservations extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false 
    };
    this.doFetch = debounce(this.doFetch, 500).bind(this);
  }

  componentDidMount() {
    this.doFetch();
  }

  doFetch() {
    this.props.fetchReservations({
      include: ['field_room', 'field_room.image_primary', 'field_room.image_primary.field_media_image'],
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
    const { reservations } = this.props;

    const teasers = items =>
      items.map(item => ({
        key: item.data.id,
        node: <ReservationTeaser 
          id={item.data.id}
          actions={
            <ButtonActions
              id={item.data.id}
              actions={["cancel", "approve", "deny"]}
            ></ButtonActions>
          }
          className="room-teaser" />
      }));

    const list =
      Object.values(reservations).length > 0 ? (
        <div>
          <ContentList
            items={teasers(Object.values(reservations))}
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
        <p key={0}>No rooms have been loaded.</p>
      );

    return <div className="rooms-list">{list}</div>;
  }
}

const AccountRoomReservationsStore = connect(mapStateToProps, mapDispatchToProps)(AccountRoomReservations);

render(
  <Provider store={store}>
    <AccountRoomReservationsStore />
  </Provider>,
  document.getElementById('roomReservationsRoot'),
);
