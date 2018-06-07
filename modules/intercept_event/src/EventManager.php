<?php

namespace Drupal\intercept_event;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\node\NodeInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class EventManager implements EventManagerInterface {

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

  public function addFromTemplate(\Drupal\node\NodeInterface $node) {
    $new_node = $node->createDuplicate();
    $new_node->set('field_event_is_template', 0);
    $new_node->setOwnerId(\Drupal::currentUser()->id());
    $form = \Drupal::service('entity.form_builder')->getForm($new_node);
    return $form;
  }
}
