<?php

namespace Drupal\intercept_core;

use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\entity\EntityPermissionProvider;
use Drupal\Component\Utility\Unicode;
use Drupal\user\EntityOwnerInterface;

class ReservationPermissionsProvider extends EntityPermissionProvider {

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

  /**
   * {@inheritdoc}
   */
  protected function buildEntityTypePermissions(EntityTypeInterface $entity_type) {
    $permissions = parent::buildEntityTypePermissions(($entity_type));
    $entity_type_id = $entity_type->id();
    $has_owner = $entity_type->entityClassImplements(EntityOwnerInterface::class);
    $singular_label = $entity_type->getSingularLabel();
    $plural_label = $entity_type->getPluralLabel();

    if ($has_owner) {
      $permissions["view own {$entity_type_id}"] = [
        'title' => $this->t('View own @type', [
          '@type' => $plural_label,
        ]),
      ];
    }
    return $permissions;
  }
}
