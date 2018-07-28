<?php

namespace Drupal\intercept_core\Controller;

use Drupal\Core\Session\AccountInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ManagementController.
 */
class ManagementController extends ManagementControllerBase {

  public function alter(array &$build, $page_name) {
    if ($page_name == 'default') {
      $build['links']['configuration'] = $this->getManagementButton('System Configuration', 'system_configuration');
    }
  }

  public function viewDefault(AccountInterface $user, Request $request) {
    return [
      'title' => $this->title('Welcome, @name', ['@name' => $user->getDisplayName()]),
      'links' => [],
    ];
  }

  public function viewSettings(AccountInterface $user, Request $request) {
    $view = $request->query->get('view');

    $build = [
      'title' => $this->title('Settings'),
    ];

    if ($view == 'logo') {
      $default_theme = \Drupal::config('system.theme')->get('default');
      $build['form'] = \Drupal::service('form_builder')->getForm('Drupal\system\Form\ThemeSettingsForm', $default_theme);
      $this->hideElements($build['form'], ['logo']);
    }
    if ($view == 'site') {
      $build['form'] = $this->formBuilder()->getForm('Drupal\system\Form\SiteInformationForm');
      if ($this->moduleHandler()->moduleExists('r4032login')) {
        $build['form']['#validate'] = array_filter($build['form']['#validate'], function($value) {
          return $value != 'r4032login_form_system_site_information_settings_validate';
        });
      }
      $this->hideElements($build['form'], ['site_information']);
    }
    if (empty($view)) {
      $table = $this->table();
      $link = $this->getButton('Logo', '<current>', [
        'view' => 'logo'
      ]);
      $table->row($link, $this->t('Change your site logo'));
      $link = $this->getButton('Site information', '<current>', [
        'view' => 'site',
      ]);
      $table->row($link, $this->t('Change basic site information'));
      $build['links'] = $table->toArray();
    }
    return $build;
  }

  public function viewSystemConfiguration(AccountInterface $user, Request $request) {
    $build = [
      'title' => $this->title('System Configuration'),
      'links' => [
        'settings' => $this->getManagementButton('Settings', 'settings'),
      ],
    ];
    $build['links']['settings']['#weight'] = 25;
    return $build;
  }
}
