import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import moment from 'moment';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import DatePicker from 'material-ui-pickers/DatePicker';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import { withFormsy, propTypes, defaultProps } from 'formsy-react';

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
  render() {
    const { handleChange, clearable, required } = this.props;
    const value = this.props.getValue();
    const onChange = (date) => {
      const d = date.toDate();
      handleChange(d)
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
          label={'Date'}
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
};
// Specifies the default values for props:
InputDate.defaultProps = {
  ...defaultProps,
  value: null,
  label: 'Date',
  clearable: true,
};

export default withStyles(styles)(withFormsy(InputDate));
