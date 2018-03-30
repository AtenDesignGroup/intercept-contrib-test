import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  formControl: {
    margin: theme.spacing.unit * 3,
  },
  group: {
    margin: `${theme.spacing.unit}px 0`,
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  label: {
    textTransform: 'uppercase',
  },
  checked: {
    fontWeight: 'bold',
  },
  unChecked: {
    fontWeight: 'bold',
    color: theme.palette.secondary.main,
  },
});

const buttonClasses = (props, checked) => ({
  label: props.classes[checked ? 'checked' : 'unChecked'],
  root: props.classes.label,
});

class ViewSwitcher extends React.Component {
  state = {
    value: 'list',
  };

  handleChange = (event, value) => {
    this.setState({ value });
    this.props.handleChange(event, value);
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <FormControl component="fieldset" required className={classes.formControl}>
          <FormLabel className="visually-hidden">View Switcher</FormLabel>
          <RadioGroup
            aria-label="view-selector"
            name="view-selector-1"
            className={classes.group}
            value={this.state.value}
            onChange={this.handleChange}
          >
            <FormControlLabel
              value="list"
              classes={buttonClasses(this.props, this.state.value === 'list')}
              control={<Radio icon={null} checkedIcon={null} />}
              label="List"
              disabled={this.state.value === 'list'}
            />
            <FormControlLabel
              classes={buttonClasses(this.props, this.state.value === 'calendar')}
              value="calendar"
              control={<Radio icon={null} checkedIcon={null} />}
              label="Calendar"
              disabled={this.state.value === 'calendar'}
            />
          </RadioGroup>
        </FormControl>
      </div>
    );
  }
}

ViewSwitcher.propTypes = {
  classes: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(ViewSwitcher);
