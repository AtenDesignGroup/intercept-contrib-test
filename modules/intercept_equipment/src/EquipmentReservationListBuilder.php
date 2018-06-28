<?php

namespace Drupal\intercept_equipment;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;

/**
 * Defines a class to build a listing of Equipment reservation entities.
 *
 * @ingroup intercept_equipment_reservation
 */
class EquipmentReservationListBuilder extends EntityListBuilder {

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['name'] = $this->t('Name');
    $header['equipment'] = $this->t('Equipment');
    $header['location'] = $this->t('Location');
    $header['user'] = $this->t('User');
    $header['status'] = $this->t('Status');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\intercept_equipment\Entity\EquipmentReservation */
    $row['name'] = $entity->link();
    $row['equipment'] = $this->getEntityLabel($entity->field_equipment->entity, $this->t('No equipment'));
    $row['location'] = $entity->get('location')->entity ? $entity->get('location')->entity->label() : '';
    $row['user'] = $this->getEntityLabel($entity->field_user->entity, $this->t('No user'));
    $row['status'] = $entity->field_status->getString();
    return $row + parent::buildRow($entity);
  }

  private function getEntityLabel(EntityInterface $entity = NULL, $default = '') {
    return $entity ? $entity->link() : $default;
  }

}
