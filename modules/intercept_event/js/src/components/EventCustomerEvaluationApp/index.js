import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import get from 'lodash/get';
import map from 'lodash/map';

/* eslint-disable */
import interceptClient from 'interceptClient';
/* eslint-enable */

/* eslint-disable */
import ButtonRegister from 'intercept/ButtonRegister';
/* eslint-enable */

// Material UI
import Button from '@material-ui/core/Button';

import EvaluationWidget from './EvaluationWidget';
import CriteriaWidget from './CriteriaWidget';
import withEvaluation from './withEvaluation';

const { api, select } = interceptClient;
const c = interceptClient.constants;

// Application States
const IDLE = 'idle';
const IN_PROGRESS = 'inProgress';
const SAVING = 'saving';
const SAVED = 'saved';
const COMPLETE = 'complete';
const ERROR = 'error';

// Evaluation Position
const LIKE = '1';
const NUETRAL = null;
const DISLIKE = '0';

class EventCustomerEvaluationApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      state: IDLE,
      value: {
        event: props.eventId,
        user: props.user.uuid,
        evaluation: NUETRAL,
        evaluation_criteria: [],
      },
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    if (!this.props.eventTypesInitialized) {
      this.props.fetchEventType();
    }
    if (!this.props.criteriaInitialized) {
      this.props.fetchEvaluationCriteria();
    }
  }

  onSubmit() {
    console.log('submit', this.state.value);
    const { setState } = this;
    this.props.saveEvaluation(this.state.value, (res) => {
      console.log(res);
      setState({ state: SAVED });
    })
  }

  getCriteriaOptions = () => {
    const evaluation = get(this, 'state.value.evaluation') || NUETRAL;
    const { eventType } = this.props;
    let options = [];

    // If there is no eventType or no evaluation, return.
    if (!eventType || evaluation === NUETRAL) {
      return options;
    }

    // Determine which field to use based on the evaluation.
    const criteriaProp =
      evaluation === LIKE ? 'field_evaluation_criteria_pos' : 'field_evaluation_criteria_neg';

    const criteria = get(eventType, `relationships.${criteriaProp}`);

    // If there is no criteria, return.
    if (!criteria) {
      return options;
    }

    options = map(criteria, item => ({
      key: item.id,
      value: get(item, 'attributes.name'),
    }));

    return options;
  };

  updateValue = key => (value) => {
    this.setState({
      value: {
        ...this.state.value,
        [key]: value,
      },
    });
  };

  render() {
    const { eventId } = this.props;

    const evaluation = (
      <EvaluationWidget
        disabled={false}
        onChange={this.updateValue('evaluation')}
        value={this.state.value.evaluation}
        name={eventId}
      />
    );

    const criteria = (
      <CriteriaWidget
        options={this.getCriteriaOptions()}
        onChange={this.updateValue('evaluation_criteria')}
        value={this.state.value.evaluation_criteria}
        name={'evaluation_criteria'}
      />
    );

    const submit = (
      <Button
        variant={'raised'}
        size="small"
        color="primary"
        className={'action-button__button'}
        disabled={this.state.value.evaluation === NUETRAL}
        onClick={this.onSubmit}
      >
        {'Submit'}
      </Button>
    );

    return (
      <div className="evaluation__app">
        {evaluation}
        {criteria}
        {submit}
      </div>
    );
  }
}

EventCustomerEvaluationApp.propTypes = {
  event: PropTypes.object,
  eventId: PropTypes.string.isRequired,
  eventTypeId: PropTypes.string,
  eventType: PropTypes.object,
  registrations: PropTypes.array,
  fetchEventType: PropTypes.func.isRequired,
  saveEvaluation: PropTypes.func.isRequired,
  user: PropTypes.object,
};

EventCustomerEvaluationApp.defaultProps = {
  event: null,
  eventTypeId: null,
  eventType: null,
  registrations: [],
  user: null,
};

const mapStateToProps = (state, ownProps) => ({
  event: select.record(select.getIdentifier(c.TYPE_EVENT, ownProps.eventId))(state),
  eventType: select.bundle(select.getIdentifier(c.TYPE_EVENT_TYPE, ownProps.eventTypeId))(state),
  registrations: select.eventRegistrationsByEventByUser(ownProps.eventId, ownProps.user.uuid)(
    state,
  ),
  eventTypesInitialized:
    select.recordsAreLoading(c.TYPE_EVENT_TYPE)(state) ||
    select.recordsUpdated(c.TYPE_EVENT_TYPE)(state) !== null,
  criteriaInitialized:
    select.recordsAreLoading(c.TYPE_EVALUATION_CRITERIA)(state) ||
    select.recordsUpdated(c.TYPE_EVALUATION_CRITERIA)(state) !== null,
});

const mapDispatchToProps = dispatch => ({
  fetchEventType: () => {
    dispatch(
      api[c.TYPE_EVENT_TYPE].fetchAll({
        filters: {
          status: {
            value: 1,
            path: 'status',
          },
        },
        fields: {
          [c.TYPE_EVENT_TYPE]: [
            'name',
            'uuid',
            'field_evaluation_criteria_neg',
            'field_evaluation_criteria_pos',
          ],
        },
      }),
    );
  },
  fetchEvaluationCriteria: () => {
    dispatch(
      api[c.TYPE_EVALUATION_CRITERIA].fetchAll({
        filters: {
          status: {
            value: 1,
            path: 'status',
          },
        },
        fields: {
          [c.TYPE_EVALUATION_CRITERIA]: ['name', 'uuid'],
        },
      }),
    );
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withEvaluation(EventCustomerEvaluationApp));
