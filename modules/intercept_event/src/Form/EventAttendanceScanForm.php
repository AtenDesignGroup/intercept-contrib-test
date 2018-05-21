<?php

namespace Drupal\intercept_event\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Form controller for Event Attendance edit forms.
 *
 * @ingroup intercept_event
 */
class EventAttendanceScanForm extends ContentEntityForm {

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
    $form['barcode'] = [
      '#type' => 'textfield',
      '#attributes' => [
        'placeholder' => $this->t('Card Number or Username'),
      ]
    ];

//    ksm($form['field_user']);
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    $entity = &$this->entity;

    $status = parent::save($form, $form_state);

    switch ($status) {
      case SAVED_NEW:
        drupal_set_message($this->t('You\'ve successfully scanned in!', [
          '%label' => $entity->label(),
        ]));
        break;
    }
    //$form_state->setRedirect('entity.event_attendance.canonical', ['event_attendance' => $entity->id()]);
  }

//  /**
//   * {@inheritdoc}
//   */
//  protected function actions(array $form, FormStateInterface $form_state) {
//    $actions = parent::actions($form, $form_state);
//    $actions['submit']['#value'] = $this->t('enter');
//    return $actions;
//  }
}
