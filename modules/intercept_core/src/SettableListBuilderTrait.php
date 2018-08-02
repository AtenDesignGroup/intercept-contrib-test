<?php

namespace Drupal\intercept_core;

trait SettableListBuilderTrait {

  /**
   * Array of entity ids.
   *
   * @var array
   */
  protected $entityIds;

  /**
   * Set the ids to use for specific entities.
   */
  public function setEntityIds(array $ids) {
    $this->entityIds = $ids;
  }

  /**
   * {@inheritdoc}
   */
  protected function getEntityIds() {
    // Override parent to see if we've set the ids first.
    if (isset($this->entityIds)) {
      return $this->entityIds;
    }
    return parent::getEntityIds();
  }
}
