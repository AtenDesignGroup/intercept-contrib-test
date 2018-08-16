<?php

namespace Drupal\intercept_core\Controller;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Controller\ControllerBase;
use Drupal\user\UserInterface;
use Drupal\intercept_core\Utility\Obfuscate;
use Symfony\Component\HttpFoundation\JsonResponse;

class UserAccount extends ControllerBase {

  public function userRedirect($route_name) {
    return $this->redirect($route_name, ['user' => $this->currentUser()->id()]);
  }

  public function customerSearchApi(\Symfony\Component\HttpFoundation\Request $request) {
    // Accept query sring params, and then also accept a post request.
    $params = $request->query->get('filter');

    if ($post = Json::decode($request->getContent())) {
      $params = empty($params) ? $post : array_merge($params, $post);
    }
    $search = \Drupal::service('polaris.client')->patron->searchBasic($params);
    foreach ($search as &$result) {
      $result['email'] = Obfuscate::email($result['email']);
    }
    return JsonResponse::create($search, 200);
  }
}
