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
    // This can also be moved into a separate function, for example:
    // 'reservation_canceled' - viewRoomReservationConfigurationReservationCanceled()
    if ($form_key = $request->query->get('view')) {
      $form = $this->formBuilder()->getForm(RoomReservationSettingsForm::class);
      $this->hideElements($form, [$form_key, 'email']);
      return $form;
    }

    $build = [
      'title' => $this->title('Room Reservations'),
      'taxonomies' => $this->getTaxonomyVocabularyTable(['meeting_purpose']),
    ];

    $build['settings'] = [
      'title' => $this->h2('Settings'),
    ];

    $table = $this->table();
    $emails = \Drupal\intercept_core\ReservationManager::emails();
    foreach ($emails as $key => $name) {
      $table->row($this->getButtonSubpage($key, $name), '');
    }

    $build['settings']['emails'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Reservation emails'),
    ];

    $build['settings']['emails']['table'] = $table->toRenderable();

    $table = $this->table();
    $table->row($this->getButtonSubpage('reservation_limit', 'Number of Customer Reservations'), '');

    $build['settings']['general'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('General settings'),
    ];

    $build['settings']['general']['table'] = $table->toRenderable();
    return $build;
  }

}
