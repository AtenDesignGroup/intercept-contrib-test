import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SelectFilter from './../SelectFilter';
import interceptClient from 'interceptClient';

const { select, api } = interceptClient;

class SelectResource extends React.Component {
  componentDidMount() {
    this.props.fetchAll({});
  }

  render() {
    const { options, handleChange, value, type, label } = this.props;
    return (
      <SelectFilter options={options} handleChange={handleChange} label={label} value={value} />
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  options: select.recordOptions(ownProps.type)(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchAll: (options) => {
    dispatch(api[ownProps.type].fetchAll(options));
  },
});

SelectResource.defaultProps = {
  value: [],
};

SelectResource.propTypes = {
  options: PropTypes.arrayOf(Object).isRequired,
  value: PropTypes.arrayOf(String),
  handleChange: PropTypes.func.isRequired,
  fetchAll: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectResource);
