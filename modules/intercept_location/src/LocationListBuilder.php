<?php

namespace Drupal\intercept_location;

use Drupal\Core\Entity\EntityInterface;
use Drupal\node\NodeListBuilder;

class LocationListBuilder extends NodeListBuilder {

  public function buildRow(EntityInterface $entity) {
    $row = parent::buildRow($entity);
    $row['type'] = $entity->field_ils_id->getString();
    return $row;
  }

  public function buildHeader() {
    $header = parent::buildHeader();
    $header['type']['data'] = $this->t('ILS ID');
    return $header;
  }

  public function load() {
    $entity_query = $this->storage->getQuery();
    $entity_query->condition('type', 'location');
    $header = $this->buildHeader();
    $entity_query->tableSort($header);
    $ids = $entity_query->execute();
    return $this->storage->loadMultiple($ids);
  }

}
