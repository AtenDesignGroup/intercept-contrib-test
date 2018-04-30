<?php

namespace Drupal\intercept_room_reservation;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;
use Drupal\entity\EntityAccessControlHandler;

/**
 * Access controller for the Room reservation entity.
 *
 * @see \Drupal\intercept_room_reservation\Entity\RoomReservation.
 */
class RoomReservationAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account) {
    /** @var \Drupal\intercept_room_reservation\Entity\RoomReservationInterface $entity */
    switch ($operation) {
      case 'view':
        if (!$entity->isPublished()) {
          return AccessResult::allowedIfHasPermission($account, 'view unpublished room reservation entities');
        }
        return AccessResult::allowedIfHasPermission($account, 'view published room reservation entities');

      case 'update':
        return AccessResult::allowedIfHasPermission($account, 'edit room reservation entities');

      case 'delete':
        return AccessResult::allowedIfHasPermission($account, 'delete room reservation entities');

      case 'cancel':
        return AccessResult::allowedIfHasPermission($account, 'cancel room reservation entities');

      case 'approve':
        return AccessResult::allowedIfHasPermission($account, 'approve room reservation entities');

      case 'decline':
        return AccessResult::allowedIfHasPermission($account, 'decline room reservation entities');
    }

    // Unknown operation, no opinion.
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    return AccessResult::allowedIfHasPermission($account, 'add room reservation entities');
  }

}
