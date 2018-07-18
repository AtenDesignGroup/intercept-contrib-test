<?php

namespace Drupal\intercept_core;

use Drupal\Component\Utility\Unicode;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class InterceptPermissionsProvider implements ContainerInjectionInterface {

  /**
   * @var ManagementManagerInterface
   */
  protected $managementManager;

  /**
   * Construct a new InterceptPermissionProvider instance.
   */
  public function __construct(ManagementManagerInterface $management_manager) {
    $this->managementManager = $management_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('plugin.manager.intercept_management') 
    );
  }

  /**
   * Callback from intercept_core.permissions.yml.
   */
  public function managementPermissions() {
    $permissions = [];
    foreach ($this->managementManager->getPagesByType() as $type => $pages) {
      $permissions["access $type management"] = [
        'title' => t("Access @type management", ['@type' => Unicode::ucwords($type)]),
      ];
      $permissions["access all $type management pages"] = [
        'title' => t("Access ALL @type management pages", ['@type' => Unicode::ucwords($type)]),
      ];
      foreach ($pages as $key => $page) {
        $permissions["access $type management page {$page['key']}"] = [
          'title' => t('Access @type management page @key', [
            '@type' => $type,
            '@key' => $page['key'],
          ]),
        ];
      }
    }
    return $permissions;
  }
}
