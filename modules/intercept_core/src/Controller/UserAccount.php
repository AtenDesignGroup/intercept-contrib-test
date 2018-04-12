<?php

namespace Drupal\intercept_core\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\user\UserInterface;

class UserAccount extends ControllerBase {

  public function userRedirect($route_name) {
    return $this->redirect($route_name, ['user' => $this->currentUser()->id()]);
  }

  public function eventsPage(UserInterface $user) {
    return ['#markup' => 'events page'];
  }

  public function settingsPage(UserInterface $user) {
    return ['#markup' => 'settings page'];
  }
}
