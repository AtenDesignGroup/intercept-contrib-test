<?php

namespace Drupal\intercept_core\Controller;

use Drupal\Core\Session\AccountInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ManagementController.
 */
class ManagementController extends ManagementControllerBase {
  public function viewStaffDefault(AccountInterface $user, Request $request) {
    return [
      '#markup' => 'dashboard',
    ];
  }

  public function viewAdminDefault(AccountInterface $user, Request $request) {
    return [
      '#markup' => 'dashboard',
    ];
  }

  public function viewAdminSystemConfiguration(AccountInterface $user, Request $request) {
    return [
      '#markup' => 'system configuration',
    ];
  }
}
