<?php

namespace Drupal\intercept_event\Form;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Entity\EntityManagerInterface;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\externalauth\ExternalAuth;
use Drupal\user\UserStorage;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Form controller for Event Attendance edit forms.
 *
 * @ingroup intercept_event
 */
class EventAttendanceScanForm extends EventAttendanceScanFormBase {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    /* @var $entity \Drupal\intercept_event\Entity\EventAttendance */
    $form = parent::buildForm($form, $form_state);

    $form['#theme'] = 'event_attendance_scan_form';
    $entity = $this->entity;

    $event = $this->entity->field_event->entity;
    $node_view = \Drupal::service('entity_type.manager')->getHandler('node', 'view_builder');
    $form['event'] = $node_view->view($event, 'summary');
    $form['instructions_header'] = [
      '#type' => 'html_tag',
      '#tag' => 'h3',
      '#attributes' => ['class' => ['instructions-header']],
      '#value' => $this->t('Scan your library card or enter your username'),
    ];
    $form['instructions_text'] = [
      '#type' => 'html_tag',
      '#tag' => 'div',
      '#attributes' => ['class' => ['instructions-text']],
      '#value' => $this->t('Scanning your library card will connect this event to your account. This helps us provide you with recommendations.'),
    ];
    $form['barcode'] = [
      '#type' => 'textfield',
      '#attributes' => [
        'placeholder' => $this->t('Card Number or Username'),
        'autofocus' => TRUE,
      ],
      '#required' => TRUE,
    ];
    $form['instructions_footer'] = [
      '#type' => 'html_tag',
      '#tag' => 'div',
      '#attributes' => ['class' => ['instructions-footer']],
      '#value' => $this->t('If you don\'t know your account number or username, but want to get recommendations, please talk with library staff.'),
    ];
    $form['guest'] = [
      '#type' => 'link',
      '#title' => $this->t("Don't have an account? Attend as a guest"),
      '#url' => \Drupal\Core\Url::fromRoute('entity.node.scan_guest', [
        'node' => $event->id(),
      ]),
    ];
    $form['#attached']['library'][] = 'intercept_event/eventCheckin';;
    $form['#attached']['drupalSettings']['eventCheckinMessage'] = $this->t(self::SUCCESS_MESSAGE);
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $barcode = $form_state->getValue('barcode');
    $user = \Drupal::service('intercept_ils.mapping_manager')->loadByBarcode($barcode);

    if (!$user) {
      $this->setBarcodeError('Invalid barcode or username.', $form, $form_state);
    }
    elseif ($this->attendanceExists($user->id(), $this->entity->field_event->entity->id())) {
      $this->setBarcodeError('You\'ve already scanned in.', $form, $form_state);
    }
    else {
      $form_state->setValue('field_user', $user->id());
      $storage = $this->entityTypeManager->getStorage('event_registration');
      $registrations = $storage->loadByProperties(['field_event' => $this->entity->field_event->entity->id(), 'field_user' => $user->id()]);
      if (!empty($registrations) && ($registration = reset($registrations))) {
        $value = $registration->field_registrants->getValue();
        if (!empty($value)) {
          $this->entity->field_attendees->setValue($value);
        }
      }
    }

    return parent::validateForm($form, $form_state);
  }

}
