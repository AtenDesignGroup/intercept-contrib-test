import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SelectFilter from './../SelectFilter';
import interceptClient from 'interceptClient';

const { select, api } = interceptClient;

class SelectEventType extends React.Component {
  componentDidMount() {
    this.props.fetchAll({});
  }

  render() {
    const { options, handleChange } = this.props;
    return <SelectFilter options={options} handleChange={handleChange} label={'Event Type'} />;
  }
}

const mapStateToProps = (state, ownProps) => ({
  options: select.eventTypesOptions(state),
});

const mapDispatchToProps = dispatch => ({
  fetchAll: (options) => {
    dispatch(api['taxonomy_term--event_type'].fetchAll(options));
  },
});

SelectEventType.propTypes = {
  options: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
  fetchAll: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectEventType);
