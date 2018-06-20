<?php

namespace Drupal\intercept_event\Controller;

use Drupal\intercept_core\Controller\ManagementControllerBase;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\HttpFoundation\Request;

class ManagementController extends ManagementControllerBase {

  public function alter(array &$build, $page_name) {
    if ($page_name == 'admin_system_configuration') {
      $build['links']['events'] = $this->getManagementButton('Events', 'admin_event_configuration');
    }
    if ($page_name == 'staff_default' || $page_name == 'admin_default') {
      $build['links']['event'] = $this->getButton('Create an event', 'intercept_event.management.staff_event_templates', [
        'user' => $this->currentUser()->id(),
      ]);
    }
  }

  public function viewAdminEventConfiguration(AccountInterface $user, Request $request) {
    return [
      'title' => $this->title('Events'),
      'taxonomies' => $this->getTaxonomyVocabularyTable(['audience', 'evaluation_criteria', 'event_type', 'tag']),
      'content_types' => [
        'title' => $this->h2('Content Types'),
        'event_template' => $this->getButton('Add Event Template', 'node.add', [
          'node_type' => 'event_template'
        ]),
        'event_series' => $this->getButton('Add Event Series', 'node.add', [
          'node_type' => 'event_series'
        ]),
      ],
    ];
  }

  public function viewStaffEvents(AccountInterface $user, Request $request) {
    return [
      '#type' => 'view',
      '#name' => 'events',
      '#display_id' => 'embed',
    ];
  }
  public function viewAdminEvents(AccountInterface $user, Request $request) {
    return $this->viewStaffEvents($user, $request);
  }

  public function viewStaffEventTemplates(AccountInterface $user, Request $request) {
    return [
      '#type' => 'view',
      '#name' => 'event_templates',
      '#display_id' => 'embed',
    ];
  }

  public function viewAdminEventTemplates(AccountInterface $user, Request $request) {
    return $this->viewStaffEventTemplates($user, $request);
  }
}
