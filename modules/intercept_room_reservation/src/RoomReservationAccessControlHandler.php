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
          return AccessResult::allowedIfHasPermission($account, 'view unpublished room_reservation');
        }
        return AccessResult::allowedIfHasPermission($account, 'view published room_reservation');

      case 'update':
        return AccessResult::allowedIfHasPermission($account, 'edit room_reservation');

      case 'delete':
        return AccessResult::allowedIfHasPermission($account, 'delete room_reservation');

      case 'cancel':
        return AccessResult::allowedIfHasPermission($account, 'cancel room_reservation');

      case 'approve':
        return AccessResult::allowedIfHasPermission($account, 'approve room_reservation');

      case 'decline':
        return AccessResult::allowedIfHasPermission($account, 'decline room_reservation');
    }

    // Unknown operation, no opinion.
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    return AccessResult::allowedIfHasPermission($account, 'create room_reservation');
  }

}
