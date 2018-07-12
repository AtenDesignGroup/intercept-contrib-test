<?php

namespace Drupal\intercept_event\Form;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Entity\EntityManagerInterface;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\externalauth\ExternalAuth;
use Drupal\intercept_event\Entity\EventAttendanceInterface;
use Drupal\user\UserStorage;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Form controller for Event Attendance edit forms.
 *
 * @ingroup intercept_event
 */
class EventAttendanceScanFormBase extends ContentEntityForm {

  const SUCCESS_MESSAGE = 'You\'ve successfully scanned in!';

  /**
   * @var ExternalAuth
   */
  protected $externalAuth;

  /**
   * {@inheritdoc}
   */
  public function __construct(EntityManagerInterface $entity_manager, EntityTypeBundleInfoInterface $entity_type_bundle_info = NULL, TimeInterface $time = NULL, ExternalAuth $external_auth) {
    parent::__construct($entity_manager, $entity_type_bundle_info, $time);
    $this->externalAuth = $external_auth;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity.manager'),
      $container->get('entity_type.bundle.info'),
      $container->get('datetime.time'),
      $container->get('externalauth.externalauth')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    $entity = &$this->entity;

    $status = parent::save($form, $form_state);

    switch ($status) {
      case SAVED_NEW:
        drupal_set_message($this->t(self::SUCCESS_MESSAGE, [
          '%label' => $entity->label(),
        ]));
        break;
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function actions(array $form, FormStateInterface $form_state) {
    $actions = parent::actions($form, $form_state);
    $actions['submit']['#value'] = $this->t('enter');
    return $actions;
  }

  /**
   * Check if the attendance exists by field_event and field_user.
   *
   * @param $uid
   *   User id derived from the barcode.
   * @param $event_id
   *   Node id for the current event being attended.
   * @return bool|EventAttendanceInterface
   */
  protected function attendanceExists($uid, $event_id) {
    $storage = \Drupal::service('entity_type.manager')->getStorage('event_attendance');
    $result = $storage->loadByProperties([
      'field_event' => $event_id,
      'field_user' => $uid,
    ]);
    return !empty($result) ? reset($result) : FALSE;
  }

  /**
   * Common function to set an error for the barcode and clear the form.
   *
   * @param $message
   *   Text to display to the user.
   * @param $form
   * @param FormStateInterface $form_state
   */
  protected function setBarcodeError($message, &$form, FormStateInterface $form_state) {
    $form_state->setErrorByName('barcode', $this->t($message));
    // Reset completely so it can be re-scanned.
    $form['barcode']['#value'] = '';
    $form_state->setValue('barcode', '');
  }
}
