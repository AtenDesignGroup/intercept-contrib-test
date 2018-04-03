<?php

namespace Drupal\intercept_ils;


use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Drupal\Core\Entity\EntityManagerInterface;
use Drupal\Core\Password\PasswordInterface;
use Drupal\externalauth\Authmap;
use Drupal\externalauth\ExternalAuth;
use Drupal\polaris\Client;
use Drupal\user\UserAuth;
use Symfony\Component\DependencyInjection\Reference;

class Auth extends UserAuth {

  private $userAuth;

  private $client;

  private $externalAuth;

  public function __construct(EntityManagerInterface $entity_manager, PasswordInterface $password_checker, UserAuth $user_auth, Client $client, ExternalAuth $external_auth, Authmap $external_authmap) {
    $this->userAuth = $user_auth;
    $this->client = $client;
    $this->externalAuth = $external_auth;
    $this->externalAuthmap = $external_authmap;
    parent::__construct($entity_manager, $password_checker);
  }

  /**
   * {@inheritdoc}
   */
  public function authenticate($username, $password) {
    // Let Drupal authenticate first to speed up authentication.
    $auth = parent::authenticate($username, $password);
    if ($auth) {
      return $auth;
    }
    // Do not check Polaris if a user just supplies the wrong password.
    if ($this->isValidUsername($username)) {
      return $auth;
    }
    // First get user if stored in authmap and let Drupal authenticate.
    if ($user = $this->externalAuth->load($username, 'polaris')) {
      $user->set('ils_authentication', TRUE);
      // TODO: This should be moved to the Polaris event subscriber for login.
      $patron = $this->client->patron->get($username);
      $this->externalAuthmap->save($user, 'polaris', $username, $patron->basicData());
      return $user->id();
    }
    // If there's no authmap stored, check if this is a valid patron and PIN.
    if (($patron = $this->client->patron->get($username)) && $patron->authenticate($password)) {
      // This should go in the event subscriber.
      $data = $patron->basicData();
      $account_data = [
        'name' => $username,
        'mail' => $data->EmailAddress,
        'init' => $data->EmailAddress,
      ];
      // Create a Drupal user automatically and return the new user_id.
      $user = $this->externalAuth->register($username, 'polaris', $account_data, $data);
      return $user->id();
    }
    return $auth;
  }

  private function isValidUsername($username) {
    return \Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['name' => $username]);
  }
  /**
   * Automatically inherit methods if they are public.
   */
  public function __call($method, $args) {
    return call_user_func_array(array($this->innerService, $method), $args);
  }
}
