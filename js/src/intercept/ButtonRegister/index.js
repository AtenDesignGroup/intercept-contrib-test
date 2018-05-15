import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  button: {},
});

function ButtonRegister(props) {
  const { classes } = props;
  return (
    <Button variant="raised" size="small" color="primary" className={classes.button}>
      Register
    </Button>
  );
}

ButtonRegister.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ButtonRegister);
