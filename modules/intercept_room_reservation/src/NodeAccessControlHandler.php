<?php

namespace Drupal\intercept_room_reservation;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\node\NodeAccessControlHandler as CoreNodeAccessControlHandler;

class NodeAccessControlHandler extends CoreNodeAccessControlHandler {

    /**
     * {@inheritdoc}
     */
    protected function checkAccess(EntityInterface $node, $operation, AccountInterface $account) {
      if ($node->bundle() == 'room' && $operation == 'view') {
        if ($node->field_staff_use_only->getString() === "1" && !$account->hasPermission('view staff use room reservation')) {
          return AccessResult::forbidden()->cachePerPermissions()->cachePerUser()->addCacheableDependency($node);
        }
      }
      return parent::checkAccess($node, $operation, $account);
    }
}
