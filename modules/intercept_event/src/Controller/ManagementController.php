<?php

namespace Drupal\intercept_event\Controller;

use Drupal\intercept_core\Controller\ManagementControllerBase;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\HttpFoundation\Request;

class ManagementController extends ManagementControllerBase {
  public function viewStaffEvents(AccountInterface $user, Request $request) {
    return [
      '#type' => 'view',
      '#name' => 'events',
      '#display_id' => 'embed',
    ];
  }

  public function viewStaffEventTemplates(AccountInterface $user, Request $request) {
    return [
      '#type' => 'view',
      '#name' => 'event_templates',
      '#display_id' => 'embed',
    ];
  }

  public function viewAdminEvents(AccountInterface $user, Request $request) {
    return [
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
}
