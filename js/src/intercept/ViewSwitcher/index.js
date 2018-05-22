import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';

const styles = theme => ({
  checked: {
    fontWeight: 'bold',
  },
  unChecked: {
    fontWeight: 'bold',
    color: theme.palette.secondary.main,
  },
});

class ViewSwitcher extends React.PureComponent {
  render() {
    const { value, handleChange, options } = this.props;
    const itemClasses = active => `view-switcher__button ${active && 'view-switcher__button--active'}`;

    return (
      <div className="view-switcher">
        {options.map(option => (
          <button
            key={option.key}
            className={itemClasses(value === option.key)}
            disabled={value === option.key}
            onClick={() => handleChange(option.key)}
          >{option.value}</button>))}
      </div>
    );
  }
}

ViewSwitcher.propTypes = {
  handleChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
};

ViewSwitcher.defaultProps = {
  value: 'list',
};

export default withStyles(styles)(ViewSwitcher);
