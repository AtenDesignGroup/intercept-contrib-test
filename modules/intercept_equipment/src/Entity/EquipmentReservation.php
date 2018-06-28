<?php

namespace Drupal\intercept_equipment\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\RevisionableContentEntityBase;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\intercept_equipment\Field\Computed\EntityReferenceFieldItemList;
use Drupal\intercept_equipment\Field\Computed\FileFieldItemList;
use Drupal\intercept_equipment\Field\Computed\MethodItemList;
use Drupal\user\UserInterface;

/**
 * Defines the Equipment reservation entity.
 *
 * @ingroup intercept_equipment_reservation
 *
 * @ContentEntityType(
 *   id = "equipment_reservation",
 *   label = @Translation("Equipment reservation"),
 *   handlers = {
 *     "storage" = "Drupal\intercept_equipment\EquipmentReservationStorage",
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\intercept_equipment\EquipmentReservationListBuilder",
 *     "views_data" = "Drupal\intercept_equipment\Entity\EquipmentReservationViewsData",
 *     "translation" = "Drupal\intercept_equipment\EquipmentReservationTranslationHandler",
 *
 *     "form" = {
 *       "default" = "Drupal\intercept_equipment\Form\EquipmentReservationForm",
 *       "reserve" = "Drupal\intercept_equipment\Form\EquipmentReservationReserveForm",
 *       "add" = "Drupal\intercept_equipment\Form\EquipmentReservationForm",
 *       "edit" = "Drupal\intercept_equipment\Form\EquipmentReservationForm",
 *       "delete" = "Drupal\intercept_equipment\Form\EquipmentReservationDeleteForm",
 *       "cancel" = "Drupal\intercept_equipment\Form\EquipmentReservationUpdateStatusForm",
 *       "approve" = "Drupal\intercept_equipment\Form\EquipmentReservationUpdateStatusForm",
 *       "decline" = "Drupal\intercept_equipment\Form\EquipmentReservationUpdateStatusForm",
 *     },
 *     "access" = "Drupal\intercept_equipment\EquipmentReservationAccessControlHandler",
 *     "permission_provider" = "Drupal\intercept_equipment\EquipmentReservationPermissionsProvider",
 *     "route_provider" = {
 *       "html" = "Drupal\intercept_equipment\EquipmentReservationHtmlRouteProvider",
 *       "revision" = "Drupal\intercept_equipment\EquipmentReservationRevisionRouteProvider",
 *       "delete-multiple" = "Drupal\entity\Routing\DeleteMultipleRouteProvider",
 *     },
 *   },
 *   base_table = "equipment_reservation",
 *   data_table = "equipment_reservation_field_data",
 *   revision_table = "equipment_reservation_revision",
 *   revision_data_table = "equipment_reservation_field_revision",
 *   translatable = TRUE,
 *   admin_permission = "administer equipment reservation entities",
 *   entity_keys = {
 *     "id" = "id",
 *     "revision" = "vid",
 *     "uuid" = "uuid",
 *     "uid" = "author",
 *     "langcode" = "langcode",
 *     "status" = "status",
 *   },
 *   links = {
 *     "approve-form" = "/equipment-reservation/{equipment_reservation}/approve",
 *     "add-form" = "/equipment-reservation/add",
 *     "collection" = "/admin/content/equipment-reservations",
 *     "cancel-form" = "/equipment-reservation/{equipment_reservation}/cancel",
 *     "canonical" = "/equipment-reservation/{equipment_reservation}",
 *     "edit-form" = "/equipment-reservation/{equipment_reservation}/edit",
 *     "decline-form" = "/equipment-reservation/{equipment_reservation}/decline",
 *     "delete-form" = "/equipment-reservation/{equipment_reservation}/delete",
 *     "delete-multiple-form" = "/equipment-reservation/delete",
 *     "version-history" = "/equipment-reservation/{equipment_reservation}/revisions",
 *     "revision" = "/equipment-reservation/{equipment_reservation}/revisions/{equipment_reservation_revision}/view",
 *     "revision-revert-form" = "/equipment-reservation/{equipment_reservation}/revisions/{equipment_reservation_revision}/revert",
 *     "revision-delete-form" = "/equipment-reservation/{equipment_reservation}/revisions/{equipment_reservation_revision}/delete",
 *     "translation_revert" = "/admin/structure/equipment_reservation/{equipment_reservation}/revisions/{equipment_reservation_revision}/revert/{langcode}",
 *   },
 *   field_ui_base_route = "equipment_reservation.settings"
 * )
 */
class EquipmentReservation extends RevisionableContentEntityBase implements EquipmentReservationInterface {

  use EntityChangedTrait;

  use StringTranslationTrait;


  /**
   * {@inheritdoc}
   */
  public static function preCreate(EntityStorageInterface $storage_controller, array &$values) {
    parent::preCreate($storage_controller, $values);
    $values += [
      'author' => \Drupal::currentUser()->id(),
    ];
  }

  public function label() {
    $dates = $this->get('field_dates')->first();
    if (!$dates || !$dates->get('value') || !$dates->get('end_value')) {
      return '';
    }
    $values = [];
    if ($from_date = $dates->get('value')->getDateTime()) {
      $values['@date'] = $from_date->format('F n, Y');
      $values['@time_start'] = $from_date->format('h:i A');
    }
    if ($to_date = $dates->get('end_value')->getDateTime()) {
      $values['@time_end'] = $to_date->format('h:i A');
    }
    return !empty($values) ? $this->t('@date from @time_start to @time_end', $values) : '';
  }

  public function location() {
    return $this->t('At @location @equipment', [
      '@location' => $this->get('equipment_location')->entity ? $this->get('equipment_location')->entity->label() : '',
      '@equipment' => $this->get('field_equipment')->entity ? $this->get('field_equipment')->entity->label() : '',
    ]);
  }

  /**
   * {@inheritdoc}
   */
  protected function urlRouteParameters($rel) {
    $uri_route_parameters = parent::urlRouteParameters($rel);

    if ($rel === 'revision-revert-form' && $this instanceof RevisionableInterface) {
      $uri_route_parameters[$this->getEntityTypeId() . '_revision'] = $this->getRevisionId();
    }
    if ($rel === 'revision-delete-form' && $this instanceof RevisionableInterface) {
      $uri_route_parameters[$this->getEntityTypeId() . '_revision'] = $this->getRevisionId();
    }

    return $uri_route_parameters;
  }

  public function cancel() {
    $this->set('field_status', 'canceled');
    return $this;
  }

  public function approve() {
    $this->set('field_status', 'approved');
    return $this;
  }

  public function deny() {
    return $this->decline();
  }

  public function decline() {
    $this->set('field_status', 'denied');
    return $this;
  }


  /**
   * {@inheritdoc}
   */
  public function preSave(EntityStorageInterface $storage) {
    if (!empty($this->original) && !$this->original->get('field_status')->equals($this->get('field_status'))){
      $this->setNewRevision(TRUE);
    }
    parent::preSave($storage);

    foreach (array_keys($this->getTranslationLanguages()) as $langcode) {
      $translation = $this->getTranslation($langcode);

      // If no owner has been set explicitly, make the anonymous user the owner.
      if (!$translation->getOwner()) {
        $translation->setOwnerId(0);
      }
    }

  }

  /**
   * {@inheritdoc}
   */
  public function preSaveRevision(EntityStorageInterface $storage, \stdClass $record) {
    parent::preSaveRevision($storage, $record);

    $is_new_revision = $this->isNewRevision();
      // @see \Drupal\media\Entity\Media::preSaveRevision()
    if (!$is_new_revision && isset($this->original) && empty($record->revision_log_message)) {
      $record->revision_log_message = $this->original->revision_log_message->value;
    }

    if ($is_new_revision) {
      $record->revision_created = \Drupal::time()->getRequestTime();
      $record->revision_user =  \Drupal::currentUser()->id();
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getCreatedTime() {
    return $this->get('created')->value;
  }

  /**
   * {@inheritdoc}
   */
  public function setCreatedTime($timestamp) {
    $this->set('created', $timestamp);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function getOwner() {
    return $this->get('author')->entity;
  }

  /**
   * {@inheritdoc}
   */
  public function getOwnerId() {
    return $this->get('author')->target_id;
  }

  /**
   * {@inheritdoc}
   */
  public function setOwnerId($uid) {
    $this->set('author', $uid);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function setOwner(UserInterface $account) {
    $this->set('author', $account->id());
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function isPublished() {
    return (bool) $this->getEntityKey('status');
  }

  /**
   * {@inheritdoc}
   */
  public function setPublished($published) {
    $this->set('status', $published ? TRUE : FALSE);
    return $this;
  }

  public function title() {
    return $this->label();
  }

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields = parent::baseFieldDefinitions($entity_type);

    $fields['title'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Title'))
      ->setComputed(TRUE)
      ->setClass(MethodItemList::class)
      ->setSetting('method', 'label')
      ->setReadOnly(TRUE);

    $fields['location'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Title'))
      ->setComputed(TRUE)
      ->setClass(MethodItemList::class)
      ->setSetting('method', 'location')
      ->setReadOnly(TRUE);

    $fields['author'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Authored by'))
      ->setDescription(t('The user ID of author of the equipment reservation entity.'))
      ->setRevisionable(TRUE)
      ->setSetting('target_type', 'user')
      ->setSetting('handler', 'default')
      ->setTranslatable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'hidden',
        'type' => 'author',
        'weight' => 0,
      ])
      ->setDisplayOptions('form', [
        'type' => 'entity_reference_autocomplete',
        'weight' => 5,
        'settings' => [
          'match_operator' => 'CONTAINS',
          'size' => '60',
          'autocomplete_type' => 'tags',
          'placeholder' => '',
        ],
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    $fields['image'] = BaseFieldDefinition::create('image')
      ->setLabel(t('Image'))
      ->setDescription(t('The related equipment entity\'s image.'))
      ->setComputed(TRUE)
      ->setClass(FileFieldItemList::class)
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE)
      ->setSetting('target_fields', ['field_equipment', 'image_primary', 'field_media_image'])
      ->setReadOnly(TRUE);

    $fields['equipment_location'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Location'))
      ->setDescription(t('The related equipment\'s location entity.'))
      ->setComputed(TRUE)
      ->setClass(EntityReferenceFieldItemList::class)
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE)
      ->setTargetEntityTypeId('node')->setTargetBundle('location')
      ->setSetting('target_fields', ['field_equipment', 'field_location'])
      ->setReadOnly(TRUE);

    $fields['status'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Publishing status'))
      ->setDescription(t('A boolean indicating whether the Equipment reservation is published.'))
      ->setRevisionable(TRUE)
      ->setDefaultValue(TRUE);

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'))
      ->setDescription(t('The time that the entity was created.'));

    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'))
      ->setDescription(t('The time that the entity was last edited.'));

    $fields['revision_translation_affected'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Revision translation affected'))
      ->setDescription(t('Indicates if the last edit of a translation belongs to current revision.'))
      ->setReadOnly(TRUE)
      ->setRevisionable(TRUE)
      ->setTranslatable(TRUE);

    return $fields;
  }

}
