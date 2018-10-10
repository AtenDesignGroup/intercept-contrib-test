<?php

namespace Drupal\intercept_event\Form;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\user\UserInterface;
use Drupal\user\UserStorage;
use Symfony\Component\DependencyInjection\ContainerInterface;

class EventEvaluationJsForm extends EventEvaluationFormBase {

  public function getFormId() {
    return 'event_evaluation_js_form_' . $this->entity->id();
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

    // Attach library here.
    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Submit handled by react.js.
  }

}
