import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
});

function DateFilter(props) {
  const { classes, label, defaultValue, handleChange } = props;

  return (
    <form className={classes.container} noValidate>
      <TextField
        id="date"
        label={label}
        type="date"
        defaultValue={defaultValue}
        className={classes.textField}
        onChange={handleChange}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </form>
  );
}

const now = new Date();

// Specifies the default values for props:
DateFilter.defaultProps = {
  defaultValue: `${now.getFullYear}-${now.getMonth}-${now.getDate}`,
  label: 'Date',
};

DateFilter.propTypes = {
  classes: PropTypes.object.isRequired,
  defaultValue: PropTypes.string,
  label: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(DateFilter);
