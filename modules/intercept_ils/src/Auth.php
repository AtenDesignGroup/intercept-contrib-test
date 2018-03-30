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
    /**
     * First just do a call to externalauth load, if that's true, pass to parent and validate password.
     *
     * If that fails, check if the current $username and $password are valid in external system - call to polaris.
     * - If TRUE - Automatically generate user with user register.
     * - If FALSE - Pass back to parent to deny authentication.
     */
    if ($user = $this->externalAuth->load($username, 'polaris')) {
      $user->set('ils_authentication', TRUE);
      // TODO: This should be moved to the Polaris event subscriber for login.
      $patron = $this->client->patron->get($username);
      $this->externalAuthmap->save($user, 'polaris', $username, $patron->basicData());
      return $user->id();
    }
    if (($patron = $this->client->patron->get($username)) && $patron->authenticate($password)) {
      // This should go in the event subscriber.
      $data = $patron->basicData();
      $account_data = [
        'name' => $username,
        'mail' => $data->EmailAddress,
        'init' => $data->EmailAddress,
      ];
      $user = $this->externalAuth->register($username, 'polaris', $account_data, $data);
      return $user->id();
    }
    return parent::authenticate($username, $password);
  }

  /**
   * Automatically inherit methods if they are public.
   */
  public function __call($method, $args) {
    return call_user_func_array(array($this->innerService, $method), $args);
  }
}
