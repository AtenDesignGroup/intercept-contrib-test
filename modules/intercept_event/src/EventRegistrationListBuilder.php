<?php

namespace Drupal\intercept_event;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;
use Drupal\Core\Url;

/**
 * Defines a class to build a listing of Event Registration entities.
 *
 * @ingroup intercept_event
 */
class EventRegistrationListBuilder extends EntityListBuilder {

  use EventListBuilderTrait;

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header = [];
    $this->addEventHeader($header);
    $header['name'] = $this->t('Customer');
    $header['count'] = $this->t('Total');
    $header['status'] = $this->t('Status');
    $header['user'] = $this->t('Registered By');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    $row = [];
    $authdata = [];
    $this->addEventRow($row, $entity);
    //kint($entity);
    $user = $entity->get('field_user')->entity;
    $guest_name = $entity->get('field_guest_name')->getValue();
    if ($user) {
      // Use the $entity information to pull the customer's actual name instead of
      // the name of the event registration.
      $uid = $entity->get('field_user')->entity->id();
      // Use the UID now to get the barcode and name of the customer.
      $authdata = $this->getAuthdata($uid);
    }
    if ($authdata) {
      $email_link = Link::fromTextAndUrl($authdata->EmailAddress, Url::fromUri('mailto:' . $authdata->EmailAddress))->toString();
      $row['name'] = [
        'data' => [
          '#markup' => $authdata->NameFirst . ' ' . $authdata->NameLast . ' (' . $authdata->Barcode . ')<br>' . $authdata->PhoneNumber . ' ' . $email_link,
        ],
      ];
    }
    else if (!empty($uid)) {
      // Backup info can come from $user if it's a non-customer.
      $user = \Drupal\user\Entity\User::load($uid);
      $row['name'] = $user->getUsername();
    }
    else if (!empty($guest_name)) {
      $guest_email = $entity->get('field_guest_email')->getValue();
      $guest_phone_number = $entity->get('field_guest_phone_number')->getValue();
      $email_link = Link::fromTextAndUrl($guest_email[0]['value'], Url::fromUri('mailto:' . $guest_email[0]['value']))->toString();
      $row['name'] = [
        'data' => [
          '#markup' => $guest_name[0]['value'] . '<br>' . $guest_phone_number[0]['value'] . ' ' . $email_link,
        ],
      ];
    }
    else {
      $row['name'] = 'Unknown customer';
    }

    $row['count'] = $entity->total();
    $row['status'] = $entity->status->getString();
    $row['user'] = strip_tags($this->getUserLink($entity));
    return $row + parent::buildRow($entity);
  }

  /**
   * Get authdata for user in the row in order to display customer info.
   */
  protected function getAuthdata($uid) {
    $authmap = \Drupal::service('externalauth.authmap');
    $authdata = $authmap->getAuthdata($uid, 'polaris');
    $authdata_data = unserialize($authdata['data']);
    if (isset($authdata_data->Barcode)) {
      $barcode = $authdata_data->Barcode;
      $client = \Drupal::service('polaris.client');
      $result = $client->patron->searchByBarcode($barcode);
    }
    return $authdata_data;
  }

}
