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
      $type = $page_name == 'staff_default' ? 'staff' : 'admin';
      $route = "intercept_event.management.{$type}_event_templates";
      $build['links']['event'] = $this->getButton('Create an event', $route, [
        'user' => $this->currentUser()->id(),
      ]);
      $build['links']['events_all'] = $this->getButton('View All Events', 'intercept_event.events_all');
    }
  }

  public function viewAdminEventConfiguration(AccountInterface $user, Request $request) {
    $lists = $this->table();
    $link = $this->getButton('Event Series', 'system.admin_content', [
          'type' => 'event_series',
    ]);
    $lists->row($link, $this->t('List of all Event Series, a method for grouping events together (e.g. Summer Reading Challenge).'));
    $link = $this->getButton('Event Templates', 'system.admin_content', [
          'type' => 'event',
    ]);
    $lists->row($link, $this->t('List of all events categorized as a template. Only System Admins can categorize an event as a template.'));

    return [
      'title' => $this->title('Events'),
      'taxonomies' => $this->getTaxonomyVocabularyTable(['audience', 'evaluation_criteria', 'event_type', 'tag']),
      'content_types' => [
        'title' => $this->h2('Content Types'),
        'event_template' => $this->getButton('Add Event Template', 'node.add', [
          'node_type' => 'event',
          'template' => 1,
        ]),
        'event_series' => $this->getButton('Add Event Series', 'node.add', [
          'node_type' => 'event_series'
        ]),
        'lists' => $lists->toArray(),
      ],
    ];
  }

  public function viewStaffEvents(AccountInterface $user, Request $request) {
    return [
      '#type' => 'view',
      '#name' => 'intercept_events',
      '#display_id' => 'embed',
    ];
  }

  public function viewAdminEvents(AccountInterface $user, Request $request) {
    return $this->viewStaffEvents($user, $request);
  }

  public function viewStaffEventTemplates(AccountInterface $user, Request $request) {
    return [
      '#type' => 'view',
      '#name' => 'intercept_event_templates',
      '#display_id' => 'embed',
    ];
  }

  public function viewAdminEventTemplates(AccountInterface $user, Request $request) {
    return $this->viewStaffEventTemplates($user, $request);
  }
}
