<?php

namespace Drupal\intercept_location\Controller;

use Drupal\intercept_core\Controller\ManagementControllerBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\intercept_location\RoomListBuilder;
use Symfony\Component\HttpFoundation\Request;

class ManagementController extends ManagementControllerBase {

  public function alter(array &$build, $page_name) {
    if ($page_name == 'system_configuration') {
      $build['links']['location_rooms'] = $this->getManagementButton('Locations & Rooms', 'locations_rooms');
      $build['links']['location_rooms']['#weight'] = -25;
    }
  }

  public function viewLocationsRooms(AccountInterface $user, Request $request) {
    return [
      'title' => $this->title('Locations & Rooms'),
      'taxonomies' => $this->getTaxonomyVocabularyTable(['room_type']),
      'content_types' => [
        'title' => $this->h2('Content Types'),
        'event_template' => $this->getButton('Add Location', 'node.add', [
          'node_type' => 'location'
        ]),
        'event_series' => $this->getButton('Add Room', 'node.add', [
          'node_type' => 'room'
        ]),
      ],
      'list' => $this->getList(RoomListBuilder::class),
    ];
  }
}

