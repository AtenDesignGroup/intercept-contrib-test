<?php

namespace Drupal\intercept_event\Form;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Entity\EntityManagerInterface;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\externalauth\ExternalAuth;
use Drupal\user\UserStorage;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Form controller for Event Attendance edit forms.
 *
 * @ingroup intercept_event
 */
class EventAttendanceScanGuestForm extends EventAttendanceScanFormBase {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    /* @var $entity \Drupal\intercept_event\Entity\EventAttendance */
    $form = parent::buildForm($form, $form_state);

    $form['#theme'] = 'event_attendance_scan_form';
    $entity = $this->entity;

    $event = $this->entity->field_event->entity;
    $node_view = \Drupal::service('entity_type.manager')->getHandler('node', 'view_builder');
    $form['event'] = $node_view->view($event, 'summary');
    $form['instructions_header'] = [
      '#type' => 'html_tag',
      '#tag' => 'h4',
      '#attributes' => ['class' => ['instructions-header']],
      '#value' => $this->t('Enter your zip code to mark your attendance'),
    ];
    $form['field_guest_zip_code']['widget'][0]['value']['#title_display'] = 'attribute';
    $form['cancel'] = [
      '#type' => 'link',
      '#title' => $this->t('Cancel'),
      '#url' => \Drupal\Core\Url::fromRoute('entity.node.scan', [
        'node' => $event->id(),
      ]),
    ];

    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);
    $form_state->setRedirect('entity.node.scan', [
      'node' => $this->entity->field_event->entity->id(),
    ]);
  }
}
