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
    const { value, multiple } = this.props;
    return (
      <SelectFilter {...this.props} value={value === null && multiple ? [] : value} />
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
  multiple: false,
  value: null,
};

SelectResource.propTypes = {
  options: PropTypes.arrayOf(Object).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(String),
    PropTypes.string,
  ]),
  handleChange: PropTypes.func.isRequired,
  fetchAll: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  multiple: PropTypes.bool,
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectResource);
