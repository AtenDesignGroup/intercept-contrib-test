import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Input, { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import { ListItemText } from 'material-ui/List';
import Select from 'material-ui/Select';
import Checkbox from 'material-ui/Checkbox';
import Chip from 'material-ui/Chip';
import findIndex from 'lodash/findIndex';

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    maxWidth: 300,
    width: '100%',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit / 4,
  },
  inputLabel: {
    margin: 0,
  },
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getLabel(options, key) {
  const index = findIndex(options, item => item.key === key);
  return index > -1 ? options[index].value : null;
}

class SelectFilter extends React.Component {
  state = {
    value: [],
  };

  handleChange = (event) => {
    this.setState({ value: event.target.value });
    this.props.handleChange(event);
  };

  render() {
    const { classes, theme, options, label } = this.props;

    return (
      <div className={classes.root}>
        <FormControl className={classes.formControl}>
          <InputLabel className={classes.inputLabel} htmlFor="select-multiple-chip">
            {label}
          </InputLabel>
          <Select
            multiple
            value={this.state.value}
            onChange={this.handleChange}
            input={<Input id="select-multiple-chip" />}
            renderValue={selected => (
              <div className={classes.chips}>
                {selected.map(value => (
                  <Chip key={value} label={getLabel(options, value)} className={classes.chip} />
                ))}
              </div>
            )}
            MenuProps={MenuProps}
          >
            {options.map(option => (
              <MenuItem
                key={option.key}
                value={option.key}
                style={{
                  fontWeight:
                    this.state.value.indexOf(option.key) === -1
                      ? theme.typography.fontWeightRegular
                      : theme.typography.fontWeightMedium,
                }}
              >
                {option.value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    );
  }
}

SelectFilter.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  // value: PropTypes.string,
  options: PropTypes.arrayOf(Object).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(SelectFilter);
