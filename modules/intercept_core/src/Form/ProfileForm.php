<?php

namespace Drupal\intercept_core\Form;

use Drupal\Core\Form\FormStateInterface;
use Drupal\profile\Form\ProfileForm as CoreProfileForm;

/**
 * @deprecated
 *
 * TODO: Delete.
 */
class ProfileForm extends CoreProfileForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildForm($form, $form_state);
    if ($this->getFormDisplay($form_state)->getComponent('pin')) { 
      $form['pin'] = [
        '#title' => $this->t('Pin'),
        '#type' => 'password',
      ];
    }
    if ($this->getFormDisplay($form_state)->getComponent('card_number')) { 
      $profile = $this->getEntity();
      $user = $this->getEntityFromRouteMatch($this->getRouteMatch(), 'user');
      $patron = \Drupal::service('polaris.client')->patron->getByUser($user);
      $form_state->set('patron', $patron);
      $form['card_number'] = [
        '#type' => 'item',
        '#title' => $this->t('Card number'),
        '#markup' => $patron ? $patron->barcode : '',
      ];
    }
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    $profile = $this->entity;
    $values = $form_state->getValues();
    $patron = $form_state->get('patron');
    if (!empty($values['pin']) && !empty($patron)) {
      $patron->Password = $values['pin'];
      $patron->update();
    }
    switch ($this->entity->save()) {
      case SAVED_NEW:
      case SAVED_UPDATED:
        drupal_set_message($this->t('Your account settings have been updated.'));
        break;
    }

    $form_state->setRedirect('<current>');
  }

}
