import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import DatePicker from 'material-ui-pickers/DatePicker';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import { withFormsy, propTypes, defaultProps } from 'formsy-react';
import interceptClient from 'interceptClient';

const { utils } = interceptClient;

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

const InputLabelProps = value => ({
  shrink: value !== null,
  className: 'date-filter__label',
});

class InputDate extends React.Component {
  onChange = (date) => {
    const d = date
      ? date
        .tz(utils.getUserTimezone())
        .startOf('day')
        .toDate()
      : null;
    this.props.setValue(d);
    this.props.handleChange(d);
  };

  onClear = () => this.onChange(null);

  render() {
    const { clearable, disabled, required, label } = this.props;

    const value = this.props.getValue();
    const inputValue = value === '' ? null : value;

    return (
      <MuiPickersUtilsProvider utils={MomentUtils} moment={moment}>
        <DatePicker
          onChange={this.onChange}
          onClear={this.onClear}
          clearable={clearable}
          disabled={disabled}
          label={label}
          required={required}
          InputLabelProps={InputLabelProps(inputValue)}
          value={inputValue}
          className="date-filter input input--date"
          error={!this.props.isValid()}
          helperText={this.props.getErrorMessage()}
        />
      </MuiPickersUtilsProvider>
    );
  }
}

InputDate.propTypes = {
  ...propTypes,
  value: PropTypes.instanceOf(Date),
  handleChange: PropTypes.func.isRequired,
  clearable: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
};
// Specifies the default values for props:
InputDate.defaultProps = {
  ...defaultProps,
  value: null,
  label: 'Date',
  clearable: true,
  disabled: false,
};

export default withStyles(styles)(withFormsy(InputDate));
