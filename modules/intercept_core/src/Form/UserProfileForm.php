<?php

namespace Drupal\intercept_core\Form;

use Drupal\Core\Form\FormStateInterface;
use Drupal\profile\ProfileStorageInterface;
use Drupal\user\UserInterface;

class UserProfileForm extends \Drupal\user\ProfileForm {

  protected $profileEntity;

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $user = $form_state->getFormObject()->getEntity();
    $form['customer_profile'] = [
      '#type' => 'inline_entity_form',
      '#entity_type' => 'profile',
      '#bundle' => 'customer',
      '#form_mode' => 'customer',
      '#save_entity' => TRUE,
      '#default_value' => $this->getProfileEntity($user),
    ];

    return parent::buildForm($form, $form_state);
  }

  public function alterProfileForm(&$entity_form, $form_state) {
    $user = $form_state->getFormObject()->getEntity();
    $patron = \Drupal::service('polaris.client')->patron->getByUser($user);
    if ($patron) {
      $form_state->set('patron', $patron);
      $entity_form['field_barcode']['widget'][0]['value']['#default_value'] = $patron->barcode;
    }
  }

  protected function getProfileEntity(UserInterface  $user) {
    $profile_storage = $this->entityTypeManager->getStorage('profile');
    /** @var $profile_storage ProfileStorageInterface */
    $profile = $profile_storage->loadDefaultByUser($user, 'customer');
    if (!$profile) {
      $profile = $profile_storage->create([
        'type' => 'customer',
        'uid' => $user->id(),
      ]);
    }
    $this->profileEntity = $profile;
    return $profile;
  }

}
