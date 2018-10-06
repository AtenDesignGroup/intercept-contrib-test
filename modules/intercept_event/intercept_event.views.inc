<?php

/**
 * Implements hook_views_data_alter().
 */
function intercept_event_views_data_alter(&$data) {
  $data['users_field_data']['uid_current'] = [
    'real field' => 'uid',
    'title' => t('InterCEPT Current'),
    'help' => t('Filter the view to the currently logged in user but avoid an INNER join.'),
    'filter' => [
      'id' => 'user_current',
      'type' => 'yes-no',
    ],
  ];

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
