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

class InputDate extends React.PureComponent {
  render() {
    const { handleChange, clearable, required, label } = this.props;
    const value = this.props.getValue();
    const onChange = (date) => {
      console.log(date);
      console.log(date.toDate());
      const d = date
        .tz(utils.getUserTimezone())
        .startOf('day')
        .toDate();
      console.log(date);
      console.log(date.toDate());
      handleChange(d);
      this.props.setValue(d);
    };
    const onClear = () => handleChange(null);
    const inputValue = value === '' ? null : value;

    return (
      <MuiPickersUtilsProvider utils={MomentUtils} moment={moment}>
        <DatePicker
          onChange={onChange}
          onClear={onClear}
          clearable={clearable}
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
  label: PropTypes.string,
};
// Specifies the default values for props:
InputDate.defaultProps = {
  ...defaultProps,
  value: null,
  label: 'Date',
  clearable: true,
};

export default withStyles(styles)(withFormsy(InputDate));
