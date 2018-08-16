<?php

namespace Drupal\intercept_room_reservation\Controller;

use Drupal\intercept_core\Controller\ManagementControllerBase;
use Drupal\intercept_room_reservation\Form\RoomReservationSettingsForm;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\HttpFoundation\Request;

class ManagementController extends ManagementControllerBase {

  public function alter(array &$build, $page_name) {
    if ($page_name == 'system_configuration') {
      $build['links']['room_reservations'] = $this->getManagementButton('Room Reservations', 'room_reservation_configuration');
    }
    if ($page_name == 'default') {
      $build['links']['room'] = $this->getButton('Reserve a room', 'intercept_room_reservation.reserve_room');
    }
  }

  public function viewRoomReservations(AccountInterface $user, Request $request) {
    return [
      '#type' => 'view',
      '#name' => 'intercept_room_reservations',
      '#display_id' => 'embed', 
    ];
  }

  public function viewRoomReservationConfiguration(AccountInterface $user, Request $request) {
    $build = [
      'title' => $this->title('Room Reservations'),
      'taxonomies' => $this->getTaxonomyVocabularyTable(['meeting_purpose']),
    ];

    $table = $this->table();
    $table->row($this->getButtonSubpage('email_approve', 'Room Reservation Approved Email'), '');
    $table->row($this->getButtonSubpage('email_cancel', 'Room Reservation Canceled Email'), '');
    $table->row($this->getButtonSubpage('email_denied', 'Room Reservation Denied Email'), '');
    $table->row($this->getButtonSubpage('reservation_limit', 'Number of Customer Reservations'), '');

    $build['settings'] = [
      'title' => $this->h2('Settings'),
      'table' => $table->toArray(),
    ];

    return $build;
  }

  public function viewRoomReservationConfigurationEmailCancel(AccountInterface $user, Request $request) {
    $form = $this->formBuilder()->getForm(RoomReservationSettingsForm::class);
    $this->hideElements($form, ['reservation_canceled', 'email']);
    return $form;
  }

  public function viewRoomReservationConfigurationEmailApprove(AccountInterface $user, Request $request) {
    $form = $this->formBuilder()->getForm(RoomReservationSettingsForm::class);
    $this->hideElements($form, ['reservation_accepted', 'email']);
    return $form;
  }

  public function viewRoomReservationConfigurationEmailDenied(AccountInterface $user, Request $request) {
    $form = $this->formBuilder()->getForm(RoomReservationSettingsForm::class);
    $this->hideElements($form, ['reservation_rejected', 'email']);
    return $form;
  }

  public function viewRoomReservationConfigurationReservationLimit(AccountInterface $user, Request $request) {
    $form = $this->formBuilder()->getForm(RoomReservationSettingsForm::class);
    $this->hideElements($form, ['reservation_limit']);
    return $form;
  }
}
