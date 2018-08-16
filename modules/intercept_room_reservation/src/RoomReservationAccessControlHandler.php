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
    $account = $this->prepareUser($account);
    /** @var \Drupal\Core\Access\AccessResult $result */
    $result = parent::checkAccess($entity, $operation, $account);

    switch ($operation) {
      case 'cancel':
        return AccessResult::allowedIfHasPermission($account, 'cancel room_reservation');

      case 'approve':
        return AccessResult::allowedIfHasPermission($account, 'approve room_reservation');

      case 'decline':
        return AccessResult::allowedIfHasPermission($account, 'decline room_reservation');
    }

    return $result->addCacheableDependency($entity);
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    return AccessResult::allowedIfHasPermission($account, 'create room_reservation');
  }

}
