<?php

namespace Drupal\intercept_equipment\Controller;

use Drupal\Core\Session\AccountInterface;
use Drupal\intercept_core\Controller\ManagementControllerBase;
use Symfony\Component\HttpFoundation\Request;

class ManagementController extends ManagementControllerBase {

  public function alter(array &$build, $page_name) {
    if ($page_name == 'system_configuration') {
      $build['links']['equipment'] = $this->getManagementButton('Equipment', 'equipment_configuration');
    }
    if ($page_name == 'default') {
      $build['links']['equipment'] = $this->getButton('Reserve equipment', 'entity.equipment_reservation.add_form');
      // @TODO: Decoupled version:
      //$build['links']['equipment'] = $this->getButton('Reserve equipment', 'intercept_equipment.reserve_equipment');
      $build['links']['equipment']['#access'] = $this->currentUser->hasPermission('add equipment reservation entities');
    }
  }

  public function viewEquipmentReservations(AccountInterface $user, Request $request) {
    return [
      '#type' => 'view',
      '#name' => 'intercept_equipment_reservations',
      '#display_id' => 'embed',
    ];
  }

  public function viewEquipmentConfiguration(AccountInterface $user, Request $request) {
    return [
      'title' => $this->title('Equipment'),
      'taxonomies' => $this->getTaxonomyVocabularyTable(['equipment_type']),
      'content_types' => [
        'title' => $this->h2('Content Types'),
        'equipment_add' => $this->getButton('Add Equipment', 'node.add', [
          'node_type' => 'equipment'
        ]),
        'equipment_list' => $this->getButton('Equipment list', 'system.admin_content', [
          'status' => 'All',
          'type' => 'equipment',
          'langcode' => 'All',
        ]),
      ],
    ];
  }
}
