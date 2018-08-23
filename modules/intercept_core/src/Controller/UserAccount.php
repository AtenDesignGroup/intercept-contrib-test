<?php

namespace Drupal\intercept_core\Controller;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Controller\ControllerBase;
use Drupal\user\UserInterface;
use Drupal\intercept_core\Utility\Obfuscate;
use Symfony\Component\HttpFoundation\JsonResponse;

class UserAccount extends ControllerBase {

  public function userRedirect($route_name, \Symfony\Component\HttpFoundation\Request $request) {
    $params = \Drupal::service('current_route_match')->getParameters();
    $params->add(['user' => $this->currentUser()->id()]);
    $params->remove('route_name');

    return $this->redirect($route_name, $params->all());
  }

  public function customerRegisterApi(\Symfony\Component\HttpFoundation\Request $request) {
    $params = $this->getParams($request);
    $user = FALSE;
    if (!empty($params['barcode'])) {
      $user = \Drupal::service('intercept_ils.mapping_manager')->loadByBarcode($params['barcode']);
    }
    return JsonResponse::create(!empty($user) ? ['uuid' => $user->uuid()] : [], 200);
  }

  public function customerSearchApi(\Symfony\Component\HttpFoundation\Request $request) {
    $params = $this->getParams($request);
    $search = \Drupal::service('polaris.client')->patron->searchBasic($params);
    foreach ($search as &$result) {
      $result['email'] = Obfuscate::email($result['email']);
    }
    return JsonResponse::create($search, 200);
  }

  protected function getParams(\Symfony\Component\HttpFoundation\Request $request) {
    // Accept query sring params, and then also accept a post request.
    $params = $request->query->get('filter');

    if ($post = Json::decode($request->getContent())) {
      $params = empty($params) ? $post : array_merge($params, $post);
    }
    return $params;
  }
}
