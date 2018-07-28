<?php

namespace Drupal\intercept_room_reservation\Controller;

use Drupal\intercept_core\Controller\ManagementControllerBase;
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
    return [
      'title' => $this->title('Room Reservations'),
      'taxonomies' => $this->getTaxonomyVocabularyTable(['meeting_purpose']),
    ];
  }
}
