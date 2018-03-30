import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SelectFilter from './../SelectFilter';
import interceptClient from 'interceptClient';

const { select, api } = interceptClient;

class SelectTag extends React.Component {
  componentDidMount() {
    this.props.fetchAll({});
  }

  render() {
    const { options, handleChange } = this.props;
    return <SelectFilter options={options} handleChange={handleChange} label={'Tags'} />;
  }
}

const mapStateToProps = (state, ownProps) => ({
  options: select.tagsOptions(state),
});

const mapDispatchToProps = dispatch => ({
  fetchAll: (options) => {
    dispatch(api['taxonomy_term--tag'].fetchAll(options));
  },
});

SelectTag.propTypes = {
  options: PropTypes.arrayOf(Object).isRequired,
  handleChange: PropTypes.func.isRequired,
  fetchAll: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectTag);
