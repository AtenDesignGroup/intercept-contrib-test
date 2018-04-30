<?php

namespace Drupal\intercept_room_reservation;

use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\entity\EntityPermissionProvider;
use Drupal\Component\Utility\Unicode;

class RoomReservationPermissionsProvider extends EntityPermissionProvider {

  /**
  * {@inheritdoc}
  */
  public function buildPermissions(EntityTypeInterface $entity_type) {
    $entity_type_id = $entity_type->id();
    $plural_label = $entity_type->getPluralLabel();

    $permissions = parent::buildPermissions($entity_type);

    foreach (['cancel', 'approve', 'decline'] as $action) {
      // View permissions are the same for both granularities.
      $permissions["{$action} {$entity_type_id}"] = [
        'title' => $this->t('@action @type', [
          '@action' => Unicode::ucwords($action),
          '@type' => $plural_label,
        ]),
      ];
    }

    return $this->processPermissions($permissions, $entity_type);
  }
}
