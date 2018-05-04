<?php

namespace Drupal\intercept_event;

use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;

/**
 * Access controller for the Event Attendance entity.
 *
 * @see \Drupal\intercept_event\Entity\EventAttendance.
 */
class EventAttendanceAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account) {
    /** @var \Drupal\intercept_event\Entity\EventAttendanceInterface $entity */
    switch ($operation) {
      case 'view':
        if (!$entity->isPublished()) {
          return AccessResult::allowedIfHasPermission($account, 'view unpublished event attendance entities');
        }
        return AccessResult::allowedIfHasPermission($account, 'view published event attendance entities');

      case 'update':
        return AccessResult::allowedIfHasPermission($account, 'edit event attendance entities');

      case 'delete':
        return AccessResult::allowedIfHasPermission($account, 'delete event attendance entities');
    }

    // Unknown operation, no opinion.
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    return AccessResult::allowedIfHasPermission($account, 'add event attendance entities');
  }

}
