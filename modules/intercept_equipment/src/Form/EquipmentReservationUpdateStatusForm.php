<?php

namespace Drupal\intercept_equipment\Form;

use Drupal\Core\Entity\ContentEntityConfirmFormBase;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

/**
 * Class UpdateStatusForm.
 */
class EquipmentReservationUpdateStatusForm extends ContentEntityConfirmFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'equipment_reservation_update_status_form';
  }

  public function getQuestion() {
    return $this->t('Do you really want to @action this reservation?', [
      '@action' => $this->getStatus()->action,
    ]);
  }

  public function getCancelUrl() {
    // This should be the redirect URL.
    return Url::fromRoute('entity.equipment_reservation.canonical', [
      'equipment_reservation' => $this->entity->id(),
    ]);
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildForm($form, $form_state);
    return $form;
  }

  protected function getStatus() {
    $prefix = 'entity.equipment_reservation.';
    $map = [
      $prefix . 'cancel_form' => [
        'action' => 'cancel',
        'value' => 'canceled',
      ],
      $prefix . 'approve_form' => [
        'action' => 'approve',
        'value' => 'approved',
      ],
      $prefix . 'decline_form' => [
        'action' => 'decline',
        'value' => 'declined',
      ],
    ];
    $route_name = $this->getRouteMatch()->getRouteName();
    return !empty($map[$route_name]) ? (object) $map[$route_name] : [];
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
    $this->entity->validate();
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);
    $this->entity->field_status->setValue([$this->getStatus()->value]);
    $this->entity->save();
    drupal_set_message($this->t('The reservation has been @action', ['@action' => $this->getStatus()->status]), 'status');
    $form_state->setRedirect('entity.equipment_reservation.canonical', [
      'equipment_reservation' => $this->entity->id(),
    ]);
  }

}
