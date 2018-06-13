<?php

/**
 * Implements hook_views_data_alter().
 */
function intercept_event_views_data_alter(&$data) {
  $data['node_field_data']['event_attendance_count'] = [
    'title' => t('Event attendance count'),
    'help' => t('.'),
    'field' => [
      'id' => 'event_attendance_count',
    ],
  ];

  $data['node_field_data']['event_registration_count'] = [
    'title' => t('Event registration count'),
    'help' => t('.'),
    'field' => [
      'id' => 'event_registration_count',
    ],
  ];

  $data['node__field_location']['field_location_target_id']['filter']['id'] = 'numeric_reference';
}
