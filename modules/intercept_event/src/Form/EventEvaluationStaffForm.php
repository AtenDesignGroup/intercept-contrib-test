<?php

namespace Drupal\intercept_event\Form;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\user\UserInterface;
use Drupal\user\UserStorage;
use Symfony\Component\DependencyInjection\ContainerInterface;

class EventEvaluationStaffForm extends EventEvaluationFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'event_evaluation_staff_form_' . $this->entity->id();
  }

  /**
   * {@inheritdoc}
   */
  protected function getVoteType() {
    return \Drupal\intercept_event\EventEvaluationManager::VOTE_TYPE_STAFF_ID;
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildForm($form, $form_state);
    $evaluation = $form_state->get('evaluation');

    $wrapper_id = \Drupal\Component\Utility\Html::getUniqueId('evaluation-criteria-wrapper');

    $form['evaluation'] = [
      '#title' => $this->t('How\'d the Event Go?'),
      '#attributes' => [
        'placeholder' => $this->t('Add thoughts about your event here to use in the future.'),
      ],
      '#type' => 'textarea',
      '#default_value' => $evaluation->getFeedback(),
      '#description' => $this->t('Ask yourself questions like: Did the event meet your expectations? How does it differ from other events you\'ve held? Did you receive any feedback from attendees?'),
      '#description_display' => 'before',
    ];

    $form['actions'] = $this->buildActions();

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $evaluation = $form_state->get('evaluation');
    $vote = $form_state->getValue('evaluation');
    $evaluation->setFeedback($vote);
  }

}
