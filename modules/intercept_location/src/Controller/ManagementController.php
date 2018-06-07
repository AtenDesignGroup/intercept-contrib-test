<?php

namespace Drupal\intercept_location\Controller;

use Drupal\intercept_core\Controller\ManagementControllerBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\intercept_location\RoomListBuilder;
use Symfony\Component\HttpFoundation\Request;

class ManagementController extends ManagementControllerBase {
  public function viewAdminLocationsRooms(AccountInterface $user, Request $request) {
    return [
      'taxonomies' => $this->getTaxonomyVocabularyTable(['room_type']),
      'content_types' => [
        'title' => $this->h2('Content Types'),
        'event_template' => $this->getButton('Add Location', 'node.add', [
          'node_type' => 'room'
        ]),
        'event_series' => $this->getButton('Add Room', 'node.add', [
          'node_type' => 'location'
        ]),
      ],
      'list' => $this->getList(RoomListBuilder::class),
    ];
  }
}

