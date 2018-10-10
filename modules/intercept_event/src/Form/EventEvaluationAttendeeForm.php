<?php

namespace Drupal\intercept_event\Form;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\user\UserInterface;
use Drupal\user\UserStorage;
use Symfony\Component\DependencyInjection\ContainerInterface;

class EventEvaluationAttendeeForm extends EventEvaluationFormBase {

  public function getFormId() {
    return 'event_evaluation_attendee_form_' . $this->entity->id();
  }

  public function buildForm(array $form, FormStateInterface $form_state) {
    $node = $this->entity;
    // TODO: Change this to just make the entity the evaluation itself.
    $evaluation = $this->eventEvaluationManager->loadByEntity($node);

    $form['wrapper'] = [
      '#type' => 'html_tag',
      '#tag' => 'div',
      '#attributes' => [
        'class' => ['js-event-evaluation--attendee'],
        'data-event' => [$node->uuid()],
        'data-event-type-primary' => [
          $evaluation->getPrimaryEventType() ? $evaluation->getPrimaryEventType()->uuid() : '',
        ],
      ],
    ];
    $wrapper_id = \Drupal\Component\Utility\Html::getUniqueId('evaluation-criteria-wrapper');
    $form['evaluation'] = [
      '#title' => $this->t('How\'d the Event Go?'),
      '#type' => 'radios',
      '#options' => [
        0 => $this->t('Dislike'),
        1 => $this->t('Like'),
      ],
      '#default_value' => $evaluation->getVote(),
    ];

    if ($evaluation->hasCriteria()) {
      $evaluation_value = $form_state->getValue('evaluation');
      if (!isset($evaluation_value)) {
        $evaluation_value = $evaluation->getVote();
      }
      $options = $evaluation_value ? $evaluation->getPositiveCriteriaOptions() : $evaluation->getNegativeCriteriaOptions();
      $form['evaluation']['#ajax'] = [
        'callback' => '::ajaxCallback',
        'wrapper' => $wrapper_id,
      ];
      $form['evaluation_criteria'] = [
        '#title' => $this->t('Tell us Why'),
        '#type' => 'select',
        '#options' => $options,
        '#prefix' => '<div id="' . $wrapper_id . '">', 
        '#suffix' => '</div>',
        '#multiple' => TRUE,
        '#default_value' => $evaluation->getVoteCriteria(),
      ];
    }

    $form['save'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
      '#ajax' => [
        'callback' => '::save',
      ],
    ];

    $form_state->set('evaluation', $evaluation);

    return $form;
  }

  public function ajaxCallback(&$form, FormStateInterface $form_state) {
    return $form['evaluation_criteria'];
  }

  public function save(&$form, FormStateInterface $form_state) {
    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state) {
    $evaluation = $form_state->get('evaluation');
    $vote = $form_state->getValue('evaluation');
    $vote_criteria = [];
    if ($criteria = $form_state->getValue('evaluation_criteria')) {
      $vote_criteria['taxonomy_term'] = array_values($criteria);
    }
    $evaluation->evaluate($vote, $vote_criteria);
  }

}
