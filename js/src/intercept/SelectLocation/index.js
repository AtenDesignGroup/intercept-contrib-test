import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SelectFilter from './../SelectFilter';
import interceptClient from 'interceptClient';

const { select, api } = interceptClient;

class SelectLocation extends React.Component {
  componentDidMount() {
    this.props.fetchAll({});
  }

  render() {
    const { options, handleChange } = this.props;
    return <SelectFilter options={options} handleChange={handleChange} label={'Location'} />;
  }
}

const mapStateToProps = (state, ownProps) => ({
  options: select.locationsOptions(state),
});

const mapDispatchToProps = dispatch => ({
  fetchAll: (options) => {
    dispatch(api['node--location'].fetchAll(options));
  },
});

SelectLocation.propTypes = {
  options: PropTypes.arrayOf(Object).isRequired,
  handleChange: PropTypes.func.isRequired,
  fetchAll: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectLocation);
