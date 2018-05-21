// React
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Intercept
import interceptClient from 'interceptClient';
import drupalSettings from 'drupalSettings';

// Components
import Button from '@material-ui/core/Button';

import InputIncrementer from 'intercept/Input/InputIncrementer';

import Formsy, { addValidationRule } from 'formsy-react';
import EventRegisterConfirmation from './EventRegisterConfirmation';

addValidationRule('isRequired', (values, value) => value !== '');
addValidationRule('isPositive', (values, value) => value >= 0);
addValidationRule('isPositiveTotal', values => values >= 0);

function FormWrapper(props) {
  return (
    <div className="form">
      <h2 className="form__heading">Number of Attendees?</h2>
      {props.children}
    </div>
  );
}

class EventRegisterForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      openDialog: false,
      canSubmit: false,
      values: {},
      validationErrors: {},
    };

    this.form = React.createRef();

    this.disableButton = this.disableButton.bind(this);
    this.enableButton = this.enableButton.bind(this);
    this.getCurrentValues = this.getCurrentValues.bind(this);
    this.getValuesTotal = this.getValuesTotal.bind(this);
    this.onCloseDialog = this.onCloseDialog.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onOpenDialog = this.onOpenDialog.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.updateValue = this.updateValue.bind(this);
    this.updateValues = this.updateValues.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  onInputChange(key) {
    return (event) => {
      this.updateValue(key, event.target.value);
    };
  }

  onValueChange(key) {
    return (value) => {
      this.updateValue(key, value);
    };
  }

  onOpenDialog = () => {
    this.setState({ openDialog: true });
  };

  onCloseDialog = () => {
    this.setState({ openDialog: false });
  };

  getCurrentValues() {
    return this.form.current ? this.form.current.getModel() : this.props.values;
  }

  getValuesTotal() {
    const values = this.getCurrentValues();
    return this.props.segments.reduce((total, s) => total + (values[s.key] || 0), 0);
  }

  disableButton() {
    this.setState({ canSubmit: false });
  }

  enableButton() {
    this.setState({ canSubmit: true });
  }

  updateValue(key, value) {
    const values = { ...this.props.values, [key]: value };
    this.setState({ values });
  }

  updateValues(value) {
    const values = { ...this.props.values, ...value };
    this.setState({ values });
  }

  validateForm(values) {
    if (this.getValuesTotal(values) <= 0) {
      this.setState({
        validationErrors: {
          [this.props.segments[0].key]: 'You must register at least one person',
        },
      });
    }
    else {
      this.setState({
        validationErrors: {},
      });
    }
  }

  render() {
    const { values, segments, user, eventId } = this.props;

    if (segments.length <= 0) {
      return (
        <FormWrapper>
          <p>Loading segments</p>
        </FormWrapper>
      );
    }

    return (
      <FormWrapper>
        <Formsy
          className="form__main"
          ref={this.form}
          onChange={this.validateForm}
          onValidSubmit={this.onOpenDialog}
          onValid={this.enableButton}
          onInvalid={this.disableButton}
          validationErrors={this.state.validationErrors}
        >
          <div className="l--subsection input-group--find-room">
            {segments.map(s => (
              <InputIncrementer
                label={s.value}
                value={values[s.key] || 0}
                onChange={this.onValueChange(s.key)}
                key={s.key}
                name={s.key}
                min={0}
                int
                required={values.meeting}
                validations="isPositive"
                validationError="Attendees must be a positive number"
              />
            ))}
          </div>

          <div className="form__actions">
            <Button
              variant="raised"
              size="small"
              color="primary"
              type="submit"
              className="button button--primary"
              disabled={!this.state.canSubmit || this.getValuesTotal() <= 0}
            >
              Register
            </Button>
          </div>
        </Formsy>
        <EventRegisterConfirmation
          open={this.state.openDialog}
          onCancel={this.onCloseDialog}
          onConfirm={() => {
            this.onCloseDialog();
          }}
          values={{
            user: user.uuid,
            event: eventId,
            registrants: this.getCurrentValues(),
          }}
        />
      </FormWrapper>
    );
  }
}

EventRegisterForm.propTypes = {
  segments: PropTypes.array,
  values: PropTypes.shape({}),
  user: PropTypes.object,
  eventId: PropTypes.string.isRequired,
};

EventRegisterForm.defaultProps = {
  segments: [],
  values: {},
  user: {},
};

export default EventRegisterForm;
