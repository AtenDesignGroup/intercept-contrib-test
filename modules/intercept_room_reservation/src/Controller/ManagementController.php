<?php

namespace Drupal\intercept_room_reservation\Controller;

use Drupal\intercept_core\Controller\ManagementControllerBase;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\HttpFoundation\Request;

class ManagementController extends ManagementControllerBase {

  public function alter(array &$build, $page_name) {
    if ($page_name == 'admin_system_configuration') {
      $build['links']['room_reservations'] = $this->getManagementButton('Room Reservations', 'admin_room_reservation_configuration');
    }
    if ($page_name == 'staff_default' || $page_name == 'admin_default') {
      $build['links']['room'] = $this->getButton('Reserve a room', '<current>');
    }
  }

  public function viewStaffRoomReservations(AccountInterface $user, Request $request) {
    return [
      '#type' => 'view',
      '#name' => 'room_reservations',
      '#display_id' => 'embed', 
    ];
  }

  public function viewAdminRoomReservations(AccountInterface $user, Request $request) {
    return $this->viewStaffRoomReservations($user, $request);
  }

  public function viewAdminRoomReservationConfiguration(AccountInterface $user, Request $request) {
    return [
      'title' => $this->title('Room Reservations'),
      'taxonomies' => $this->getTaxonomyVocabularyTable(['meeting_purpose']),
    ];
  }
}
