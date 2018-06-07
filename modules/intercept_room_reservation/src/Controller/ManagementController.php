<?php

namespace Drupal\intercept_room_reservation\Controller;

use Drupal\intercept_core\Controller\ManagementControllerBase;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\HttpFoundation\Request;

class ManagementController extends ManagementControllerBase {
  public function viewStaffRoomReservations(AccountInterface $user, Request $request) {
    return [
      '#type' => 'view',
      '#name' => 'room_reservations',
      '#display_id' => 'embed', 
    ];
  }

  public function viewAdminRoomReservations(AccountInterface $user, Request $request) {
    return [
      'taxonomies' => $this->getTaxonomyVocabularyTable(['meeting_purpose']),
    ];
  }
}
