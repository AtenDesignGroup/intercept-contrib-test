import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'lodash/memoize';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import moment from 'moment';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import { withFormsy, propTypes, defaultProps } from 'formsy-react';

import interceptClient from 'interceptClient';

const { utils } = interceptClient;

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

class SelectTime extends React.Component {
  /**
   * Creates an array of time options.
   * @param min {Date}
   *  Earliest possible time option.
   * @param max {Date}
   *  Latest possible time option.
   * @param step {Number}
   *  Interval in which options are created in minutes.
   */
  static getOptions(min, max, step) {
    const options = [];
    const minDate = moment.tz(min, 'HHmm', utils.getUserTimezone()).toDate();
    const maxDate = moment.tz(max, 'HHmm', utils.getUserTimezone()).toDate();
    const i = utils.roundTo(minDate, step).clone();

    // Abort if the min time is after the max time to avoid an infinite loop.
    if (min >= max) {
      return options;
    }
    do {
      const value = utils.getTimeDisplay(i);
      options.push({
        key: i.format('HHmm'),
        value,
      });
      i.add(step, 'minutes');
    } while (i.toDate() <= maxDate);
    return options;
  }

  constructor(props) {
    super(props);
    // Memoize getOptions() to avoid unneeded date calculations.
    this.options = memoize(this.constructor.getOptions, (...args) => JSON.stringify(args));
  }

  componentDidUpdate() {
    // Force this component to be treated like a controlled component
    // by updating formsy with passed prop values.
    if (this.props.value !== this.props.getValue()) {
      this.props.setValue(this.props.value);
    }
  }

  handleChange = (event) => {
    const value = event.target.value;
    // const proxy = event;
    // proxy.target.value = value;
    this.props.setValue(value);
    this.props.onChange(value);
  };

  render() {
    const { min, max, step, label } = this.props;
    const value = this.props.getValue();
    const options = this.options(min, max, step);
    const checkboxId = id => `select-filter--${id}`;
    const checkboxLabel = (text, id) => (
      <label className="select-filter__checkbox-label" htmlFor={id}>
        {text}
      </label>
    );

    return (
      <div className="select-filter input input--select">
        <FormControl className="select-filter__control">
          <InputLabel
            className="select-filter__label"
            htmlFor="select-multiple-chip"
            required={this.props.required}
            shrink={!!value}
          >
            {label}
          </InputLabel>

          <Select
            value={value === null || !value ? '' : value}
            onChange={this.handleChange}
            MenuProps={MenuProps}
            error={!this.props.isValid()}
            required={this.props.required}
          >
            {options.map(option => (
              <MenuItem key={option.key} value={option.key} className="select-filter__menu-item">
                <ListItemText
                  disableTypography
                  primary={checkboxLabel(option.value, checkboxId(option.key))}
                />
              </MenuItem>
            ))}
          </Select>

          <FormHelperText error={!this.props.isValid()}>
            {this.props.getErrorMessage()}
          </FormHelperText>
        </FormControl>
      </div>
    );
  }
}

SelectTime.propTypes = {
  ...propTypes,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  step: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

SelectTime.defaultProps = {
  ...defaultProps,
  value: null,
  multiple: false,
  min: '0000',
  max: '1159',
  step: 15,
};

export default withStyles(styles, { withTheme: true })(withFormsy(SelectTime));
