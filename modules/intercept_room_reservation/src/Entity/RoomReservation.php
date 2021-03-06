<?php

namespace Drupal\intercept_room_reservation\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\intercept_core\Entity\ReservationBase;
use Drupal\intercept_core\Field\Computed\EntityReferenceFieldItemList;
use Drupal\intercept_core\Field\Computed\FileFieldItemList;
use Drupal\intercept_core\Field\Computed\MethodItemList;
use Drupal\user\UserInterface;

/**
 * Defines the Room reservation entity.
 *
 * @ingroup intercept_room_reservation
 *
 * @ContentEntityType(
 *   id = "room_reservation",
 *   label = @Translation("Room reservation"),
 *   handlers = {
 *     "storage" = "Drupal\intercept_room_reservation\RoomReservationStorage",
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\intercept_room_reservation\RoomReservationListBuilder",
 *     "views_data" = "Drupal\intercept_room_reservation\Entity\RoomReservationViewsData",
 *     "translation" = "Drupal\intercept_room_reservation\RoomReservationTranslationHandler",
 *
 *     "form" = {
 *       "default" = "Drupal\intercept_room_reservation\Form\RoomReservationForm",
 *       "reserve" = "Drupal\intercept_room_reservation\Form\RoomReservationReserveForm",
 *       "add" = "Drupal\intercept_room_reservation\Form\RoomReservationForm",
 *       "edit" = "Drupal\intercept_room_reservation\Form\RoomReservationForm",
 *       "delete" = "Drupal\intercept_room_reservation\Form\RoomReservationDeleteForm",
 *       "cancel" = "Drupal\intercept_room_reservation\Form\RoomReservationUpdateStatusForm",
 *       "approve" = "Drupal\intercept_room_reservation\Form\RoomReservationUpdateStatusForm",
 *       "decline" = "Drupal\intercept_room_reservation\Form\RoomReservationUpdateStatusForm",
 *     },
 *     "access" = "Drupal\intercept_room_reservation\RoomReservationAccessControlHandler",
 *     "permission_provider" = "Drupal\intercept_core\ReservationPermissionsProvider",
 *     "route_provider" = {
 *       "html" = "Drupal\intercept_room_reservation\RoomReservationHtmlRouteProvider",
 *       "revision" = "Drupal\intercept_room_reservation\RoomReservationRevisionRouteProvider",
 *       "delete-multiple" = "Drupal\entity\Routing\DeleteMultipleRouteProvider",
 *     },
 *   },
 *   base_table = "room_reservation",
 *   data_table = "room_reservation_field_data",
 *   revision_table = "room_reservation_revision",
 *   revision_data_table = "room_reservation_field_revision",
 *   translatable = TRUE,
 *   admin_permission = "administer room reservation entities",
 *   entity_keys = {
 *     "id" = "id",
 *     "revision" = "vid",
 *     "uuid" = "uuid",
 *     "uid" = "author",
 *     "langcode" = "langcode",
 *     "status" = "status",
 *   },
 *   links = {
 *     "approve-form" = "/room-reservation/{room_reservation}/approve",
 *     "add-form" = "/room-reservation/add",
 *     "collection" = "/admin/content/room-reservations",
 *     "cancel-form" = "/room-reservation/{room_reservation}/cancel",
 *     "canonical" = "/room-reservation/{room_reservation}",
 *     "edit-form" = "/room-reservation/{room_reservation}/edit",
 *     "decline-form" = "/room-reservation/{room_reservation}/decline",
 *     "delete-form" = "/room-reservation/{room_reservation}/delete",
 *     "delete-multiple-form" = "/room-reservation/delete",
 *     "version-history" = "/room-reservation/{room_reservation}/revisions",
 *     "revision" = "/room-reservation/{room_reservation}/revisions/{room_reservation_revision}/view",
 *     "revision-revert-form" = "/room-reservation/{room_reservation}/revisions/{room_reservation_revision}/revert",
 *     "revision-delete-form" = "/room-reservation/{room_reservation}/revisions/{room_reservation_revision}/delete",
 *     "translation_revert" = "/admin/structure/room_reservation/{room_reservation}/revisions/{room_reservation_revision}/revert/{langcode}",
 *   },
 *   field_ui_base_route = "room_reservation.settings"
 * )
 */
class RoomReservation extends ReservationBase implements RoomReservationInterface {

  /**
   * {@inheritdoc}
   */
  public static function reservationType() {
    return 'room';
  }

  public function cancel() {
    $this->set('field_status', 'canceled');
    return $this;
  }

  public function approve() {
    $this->set('field_status', 'approved');
    return $this;
  }

  public function request() {
    $this->set('field_status', 'requested');
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
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields = parent::baseFieldDefinitions($entity_type);

    $fields['location'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Title'))
      ->setComputed(TRUE)
      ->setClass(MethodItemList::class)
      ->setSetting('method', 'location')
      ->setReadOnly(TRUE);

    $fields['room_location'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Location'))
      ->setDescription(t('The related room\'s location entity.'))
      ->setComputed(TRUE)
      ->setClass(EntityReferenceFieldItemList::class)
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE)
      ->setTargetEntityTypeId('node')->setTargetBundle('location')
      ->setSetting('target_fields', ['field_room', 'field_location'])
      ->setReadOnly(TRUE);

    return $fields;
  }

  /**
   * {@inheritdoc}
   */
  public function preSave(EntityStorageInterface $storage) {
    parent::preSave($storage);
    if ($this->isNew()) {
      $this->setDefaultStatus();
    }
  }

  /**
   * Set status based on the room being reserved.
   */
  public function setDefaultStatus() {
    if (!$this->hasField('field_room')) {
      return;
    }
    if (!$this->get('field_room')->isEmpty()) {
      $room = $this->get('field_room')->entity;
      $approval_required = $room->field_approval_required->getString();

      $current_user = \Drupal::currentUser();
      if ($current_user->hasPermission('bypass room reservation agreement')) {
        $approval_required = FALSE;
      }

      $current_status = $this->get('field_status')->getString();

      if (!$approval_required && $current_status == 'requested') {
        $this->approve();
      }
    }
  }
}
