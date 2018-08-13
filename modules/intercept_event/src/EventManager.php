<?php

namespace Drupal\intercept_event;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Link;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\NodeInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class EventManager implements EventManagerInterface {

  use StringTranslationTrait;

  /**
   * Constructs a new EventManager object.
   */
  public function __construct(AccountProxyInterface $current_user, EntityTypeManagerInterface $entity_type_manager) {
    $this->currentUser = $current_user;
    $this->entityTypeManager = $entity_type_manager;
  }

  public function deleteRegisterAlias(NodeInterface $node) {
    $alias = $node->path->alias . '/register';
    $storage = \Drupal::service('path.alias_storage');
    $conditions = [
      'source' => '/event/' . $node->id() . '/register',
    ];
    if ($path = $storage->load($conditions)) {
      $storage->delete($conditions);
    }
  }

  public function addRegisterAlias(NodeInterface $node, $alias = NULL) {
    $alias = $alias ?: $node->path->alias;
    if (empty($alias)) {
      return;
    }
    $alias .= '/register';
    $storage = \Drupal::service('path.alias_storage');
    $conditions = [
      'source' => '/event/' . $node->id() . '/register',
    ];
    if ($path = $storage->load($conditions)) {
      $storage->save($conditions['source'], $alias, $path['langcode'], $path['pid']);
    }
    else {
      $storage->save($conditions['source'], $alias);
    }
  }

  /**
   * Create an event node clone with certain changes.
   *
   * @param NodeInterface $node
   * @return NodeInterface
   */
  private function cloneify(\Drupal\node\NodeInterface $node) {
    $new_node = $node->createDuplicate();
    $new_node->set('field_event_is_template', 0);
    foreach (['vid', 'field_date_time', 'field_event_register_period'] as $field) {
      $new_node->set($field, NULL);
    }

    $new_node->setOwnerId(\Drupal::currentUser()->id());
    return $new_node;
  }

  /**
   * View a node cloned from a template.
   *
   * @param NodeInterface $node
   * @return array
   */
  public function previewFromTemplate(\Drupal\node\NodeInterface $node) {
    $new_node = $this->cloneify($node);
    drupal_set_message($this->t('This is a preview. @use_link.', [
      '@use_link' => Link::createFromRoute('Use this template', 'entity.node.template', [
        'node' => $node->id(),
      ])->toString(),
    ]), 'warning');
    return $this->entityTypeManager->getViewBuilder('node')->view($new_node, 'full');
  }

  /**
   * Edit a node cloned from a template.
   *
   * @param NodeInterface $node
   * @return mixed
   */
  public function addFromTemplate(\Drupal\node\NodeInterface $node) {
    $form = \Drupal::service('entity.form_builder')->getForm($this->cloneify($node));
    return $form;
  }

  public function load($id) {
    // First try to see if the id provided is a uuid.
    if ($entities = $this->entityTypeManager->getStorage('node')->loadByProperties(['uuid' => $id])) {
      return reset($entities);
    }
    return \Drupal\node\Entity\Node::load($id);
  }

  public function updateAttendance(\Drupal\user\UserInterface $user = NULL, Request $request) {
    $response = NULL;
    $event_id = $this->getRequestData($request, 'event');
    if ($event = $this->load($event_id)) {
      $data = $this->getRequestData($request, 'attendance');
      array_walk($data, function(&$v, $k) {
        $v = [
          'target_id' => (string) $k,
          'count' => (int) $v,
        ];
      });
      $data = array_values($data);
      $event->field_attendees->setValue($data);
      $event->save();
      $jsonapi = \Drupal::service('jsonapi.entity.to_jsonapi');
      $response = $jsonapi->normalize($event);
    }
    return $this->jsonResponse(['response' => $response]);
  }

  public function createAttendee(\Drupal\user\UserInterface $user = NULL, Request $request) {
    $response = NULL;
    if ($barcode = $this->getRequestData($request, 'barcode')) {
      $user = \Drupal::service('intercept_ils.mapping_manager')->loadByBarcode($barcode);
      if ($user) {
        $jsonapi = \Drupal::service('jsonapi.entity.to_jsonapi');
        $response = $jsonapi->normalize($user);
      }
    }
    return $this->jsonResponse(['response' => $response]);
  }

  private function getRequestData(Request $request, $key) {
    $data = $request->getContent();
    if (!empty($data) && ($data = Json::decode($data))) {
      return !empty($data[$key]) ? $data[$key] : NULL;
    }
    return $request->get($key);
  }

  /**
   *
   * respond with json, check the response for errors and return 400
   * otherwise return response with 200
   * @param array $data
   *   ['errors' => [], 'response' => []]
   */
  protected function jsonResponse($data) {
    if (isset($data['errors']) && !empty($data['errors'])) {
      return JsonResponse::create($data['errors'], 400);
    }

    return JsonResponse::create($data['response'], 200);
  }
}
