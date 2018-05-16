<?php

namespace Drupal\intercept_ils;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\polaris\Client;

class MappingManager {

  private $entityTypeManager;

  private $client;

  private $queryFactory;

  /**
   * Mapping constructor.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, Client $client, QueryFactory $query_factory) {
    $this->entityTypeManager = $entity_type_manager;
    $this->client = $client;
    $this->queryFactory = $query_factory;
  }

  public function loadByEntity(EntityInterface $entity) {
    $entity_type = $entity->getEntityTypeId();
    $bundle = $entity->bundle();
    if ($entity_type == 'node' && $bundle == 'location') {
      return $this->loadByNodeLocation($entity);
    }
    if ($entity_type == 'user') {
      return $this->loadByUser($entity);
    }
    return FALSE;
  }

  private function loadByNodeLocation(EntityInterface $entity) {
    $organization =  $this->client->organization->getByNode($entity);
    $data = [
      'id' => !empty($organization) ? $organization->OrganizationID : NULL,
      'data' => !empty($organization) ? $organization : [],
    ];
    return $this->createMappingInstance($data);
  }

  private function loadByUser(EntityInterface $entity) {
    if (!$patron =  $this->client->patron->getByUser($entity)) {
      return FALSE;
    }
    $basic_data = $patron->data(); 
    $data = [
      'id' => !empty($basic_data) ? $basic_data->PatronID : NULL,
      'data' => !empty($basic_data) ? $basic_data : [],
    ];
    return $this->createMappingInstance($data);
  }

  private function createMappingInstance($data) {
    return new class($data) {
      private $data;
      public function __construct($data) {
        $this->data = (array) $data;
      }
      public function data() {
        return !empty($this->data['data']) ? $this->data['data'] : [];
      }
      public function id() {
        return !empty($this->data['id']) ? $this->data['id'] : FALSE;
      }
    };
  }

  public function data() {
  }

  public function id() {

  }
  /**
   * This will change heavily.
   *
   * @see intercept_ils_cron()
   */
  public function pullOrganizations() {
    foreach ($this->getNewOrganizations() as $id) {
      $org = $this->client->organization->getById($id);
      // Match by name if possible.
      $query = $this->queryFactory->get('node')
          ->condition('type', 'location')
          ->condition('title', $org->Name, '=')
          ->execute();
      if ($query) {
        $node = $this->entityTypeManager->getStorage('node')->load(reset($query));
      }
      else {
        $node = $this->entityTypeManager->getStorage('node')->create(['type' => 'location']);
        $node->setTitle($org->DisplayName);
      }
      $node->field_ils_id->setValue($org->OrganizationID);
      $node->save();
    }
  }  

  private function getNewOrganizations() {
    // Get array of the organization ids.
    $ids = array_map(function($org) {
      return $org->OrganizationID;
    }, $this->client->organization->getAll());

    $query = $this->queryFactory->get('node')
        ->condition('type', 'location')
        ->condition('field_ils_id', $ids, 'IN')
        ->execute();
    $nodes = $this->entityTypeManager->getStorage('node')->loadMultiple(array_values($query));

    return array_filter($ids, function($id) use ($nodes) {
      // Then filter out which ones already have corresponding nodes.
      foreach ($nodes as $node) {
        if ($node->field_ils_id->getString() == $id) {
          return FALSE;
        }
      }
      return TRUE;
    });
  }
}
