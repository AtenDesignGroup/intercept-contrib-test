import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Input, { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import { ListItemText } from 'material-ui/List';
import Select from 'material-ui/Select';
import Checkbox from 'material-ui/Checkbox';

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
  inputLabel: {
    margin: 0,
  },
});

const ITEM_HEIGHT = 24;
const ITEM_PADDING_TOP = 4;
const MenuListProps = {
  className: 'select-filter__menu-list',
};

const MenuProps = {
  MenuListProps,
  PaperProps: {
    style: {
      // maxHeight: (ITEM_HEIGHT * 8.5) + ITEM_PADDING_TOP,
      maxHeight: 200,
      width: 250,
    },
  },
  getContentAnchorEl: null,
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
  className: 'select-filter__menu',
};

class SelectFilter extends React.Component {
  handleChange = (event) => {
    this.props.handleChange(event);
  };

  render() {
    const { options, label, value } = this.props;
    const checkboxId = id => `select-filter--${id}`;
    const checkboxLabel = (text, id) => (
      <label className="select-filter__checkbox-label" htmlFor={id}>
        {text}
      </label>
    );

    return (
      <div className="select-filter">
        <FormControl className="select-filter__control">
          <InputLabel
            className="select-filter__label"
            htmlFor="select-multiple-chip"
            shrink={false}
          >
            {label}
          </InputLabel>

          <Select
            multiple
            value={value}
            onChange={this.handleChange}
            input={<Input id="select-multiple-chip" />}
            renderValue={() => null}
            MenuProps={MenuProps}
          >
            {options.map(option => (
              <MenuItem key={option.key} value={option.key} className="select-filter__menu-item">
                <Checkbox
                  checked={value.indexOf(option.key) > -1}
                  id={checkboxId(option.key)}
                  className="select-filter__checkbox"
                />
                <ListItemText
                  disableTypography
                  primary={checkboxLabel(option.value, checkboxId(option.key))}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    );
  }
}

SelectFilter.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(String),
  options: PropTypes.arrayOf(Object).isRequired,
  handleChange: PropTypes.func.isRequired,
};

SelectFilter.defaultProps = {
  value: PropTypes.arrayOf(String),
};

export default withStyles(styles, { withTheme: true })(SelectFilter);
