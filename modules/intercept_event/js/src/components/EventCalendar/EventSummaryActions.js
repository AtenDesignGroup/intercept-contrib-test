/* eslint-disable react/no-multi-comp */

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { connect } from 'react-redux';
import interceptClient from 'interceptClient';

const { select, constants } = interceptClient;
const c = constants;

const onLearnMore = (event) => {
  const url = event.attributes.path ? event.attributes.path.alias : `/node/${event.attributes.nid}`;
  window.location.href = url;
};


class EventSummaryActions extends React.Component {
  render() {
    const { id, event } = this.props;

    return (
      <CardActions>
        <Button size="small" color="primary">
          Register
        </Button>
        <Button size="small" color="primary" onClick={() => onLearnMore(event)}>
          Learn More
        </Button>
      </CardActions>
    );
  }
}

EventSummaryActions.propTypes = {
  id: PropTypes.string,
  event: PropTypes.object,
};

EventSummaryActions.defaultProps = {
  id: null,
  event: null,
};

const mapStateToProps = (state, ownProps) => {
  const identifier = select.getIdentifier(c.TYPE_EVENT, ownProps.id);

  return {
    event: select.bundle(identifier)(state),
  };
};

export default connect(mapStateToProps)(EventSummaryActions);
