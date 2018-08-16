<?php

namespace Drupal\intercept_room_reservation\Controller;

use Drupal\Component\Utility\Xss;
use Drupal\Component\Serialization\Json;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Url;
use Drupal\intercept_core\ReservationManagerInterface;
use Drupal\intercept_room_reservation\Entity\RoomReservationInterface;
use Drupal\user\UserInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Class RoomReservationController.
 *
 *  Returns responses for Room reservation routes.
 */
class RoomReservationController extends ControllerBase implements ContainerInjectionInterface {

  protected $reservationManager;

  /**
   * Create a new RoomReservationController.
   */
  public function __construct(ReservationManagerInterface $reservation_manager) {
    $this->reservationManager = $reservation_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('intercept_core.reservation.manager')
    );
  }

  /**
   * Hello.
   *
   * @return string
   *   Return Hello string.
   */
  public function manage(UserInterface $user) {
    $build = [];
    $build['#attached']['library'][] = 'intercept_room_reservation/manageRoomReservations';
    $build['#markup'] = '';
    $build['intercept_room_reserve']['#markup'] = '<div id="roomReservationsRoot" />';

    $build['upcoming_room_reservations'] = [
      '#type' => 'view',
      '#name' => 'intercept_room_reservations',
      '#display_id' => 'upcoming',
    ];

    return $build;
  }

  /**
   * Displays a Room reservation  revision.
   *
   * @param int $room_reservation_revision
   *   The Room reservation  revision ID.
   *
   * @return array
   *   An array suitable for drupal_render().
   */
  public function revisionShow($room_reservation_revision) {
    $room_reservation = $this->entityManager()->getStorage('room_reservation')->loadRevision($room_reservation_revision);
    $view_builder = $this->entityManager()->getViewBuilder('room_reservation');

    return $view_builder->view($room_reservation);
  }

  /**
   * Page title callback for a Room reservation  revision.
   *
   * @param int $room_reservation_revision
   *   The Room reservation  revision ID.
   *
   * @return string
   *   The page title.
   */
  public function revisionPageTitle($room_reservation_revision) {
    $room_reservation = $this->entityManager()->getStorage('room_reservation')->loadRevision($room_reservation_revision);
    return $this->t('Revision of %title from %date', ['%title' => $room_reservation->label(), '%date' => format_date($room_reservation->getRevisionCreationTime())]);
  }

  /**
   * Generates an overview table of older revisions of a Room reservation .
   *
   * @param \Drupal\intercept_room_reservation\Entity\RoomReservationInterface $room_reservation
   *   A Room reservation  object.
   *
   * @return array
   *   An array as expected by drupal_render().
   */
  public function revisionOverview(RoomReservationInterface $room_reservation) {
    $account = $this->currentUser();
    $langcode = $room_reservation->language()->getId();
    $langname = $room_reservation->language()->getName();
    $languages = $room_reservation->getTranslationLanguages();
    $has_translations = (count($languages) > 1);
    $room_reservation_storage = $this->entityManager()->getStorage('room_reservation');

    $build['#title'] = $has_translations ? $this->t('@langname revisions for %title', ['@langname' => $langname, '%title' => $room_reservation->label()]) : $this->t('Revisions for %title', ['%title' => $room_reservation->label()]);
    $header = [$this->t('Revision'), $this->t('Operations')];

    $revert_permission = (($account->hasPermission("revert all room reservation revisions") || $account->hasPermission('administer room reservation entities')));
    $delete_permission = (($account->hasPermission("delete all room reservation revisions") || $account->hasPermission('administer room reservation entities')));

    $rows = [];

    $vids = $room_reservation_storage->revisionIds($room_reservation);

    $latest_revision = TRUE;

    foreach (array_reverse($vids) as $vid) {
      /** @var \Drupal\intercept_room_reservation\RoomReservationInterface $revision */
      $revision = $room_reservation_storage->loadRevision($vid);
      // Only show revisions that are affected by the language that is being
      // displayed.
      if ($revision->hasTranslation($langcode) && $revision->getTranslation($langcode)->isRevisionTranslationAffected()) {
        $username = [
          '#theme' => 'username',
          '#account' => $revision->getRevisionUser(),
        ];

        // Use revision link to link to revisions that are not active.
        $date = \Drupal::service('date.formatter')->format($revision->getRevisionCreationTime(), 'short');
        if ($vid != $room_reservation->getRevisionId()) {
          $link = $this->l($date, new Url('entity.room_reservation.revision', ['room_reservation' => $room_reservation->id(), 'room_reservation_revision' => $vid]));
        }
        else {
          $link = $room_reservation->link($date);
        }

        $row = [];
        $column = [
          'data' => [
            '#type' => 'inline_template',
            '#template' => '{% trans %}{{ date }} by {{ username }}{% endtrans %}{% if message %}<p class="revision-log">{{ message }}</p>{% endif %}',
            '#context' => [
              'date' => $link,
              'username' => \Drupal::service('renderer')->renderPlain($username),
              'message' => ['#markup' => $revision->getRevisionLogMessage(), '#allowed_tags' => Xss::getHtmlTagList()],
            ],
          ],
        ];
        $row[] = $column;

        if ($latest_revision) {
          $row[] = [
            'data' => [
              '#prefix' => '<em>',
              '#markup' => $this->t('Current revision'),
              '#suffix' => '</em>',
            ],
          ];
          foreach ($row as &$current) {
            $current['class'] = ['revision-current'];
          }
          $latest_revision = FALSE;
        }
        else {
          $links = [];
          if ($revert_permission) {
            $links['revert'] = [
              'title' => $this->t('Revert'),
              'url' => $has_translations ?
              Url::fromRoute('entity.room_reservation.translation_revert', ['room_reservation' => $room_reservation->id(), 'room_reservation_revision' => $vid, 'langcode' => $langcode]) :
              Url::fromRoute('entity.room_reservation.revision_revert', ['room_reservation' => $room_reservation->id(), 'room_reservation_revision' => $vid]),
            ];
          }

          if ($delete_permission) {
            $links['delete'] = [
              'title' => $this->t('Delete'),
              'url' => Url::fromRoute('entity.room_reservation.revision_delete', ['room_reservation' => $room_reservation->id(), 'room_reservation_revision' => $vid]),
            ];
          }

          $row[] = [
            'data' => [
              '#type' => 'operations',
              '#links' => $links,
            ],
          ];
        }

        $rows[] = $row;
      }
    }

    $build['room_reservation_revisions_table'] = [
      '#theme' => 'table',
      '#rows' => $rows,
      '#header' => $header,
    ];

    return $build;
  }

  public function reservations(\Drupal\node\NodeInterface $node, \Symfony\Component\HttpFoundation\Request $request) {
    $reservations = $this->reservationManager->reservations('room', function($query) use ($node) {
      $query->condition('field_room', $node->id(), '=');
      $query->sort('field_dates.value', 'ASC');
    });
    $list = $this->entityTypeManager()->getListBuilder('room_reservation');

    $list->setEntityIds(array_keys($reservations));
    return $list->render();
  }

  public function availability(\Symfony\Component\HttpFoundation\Request $request) {
    // Accept query sring params, and then also accept a post request.
    $params = $request->query->get('filter');

    if ($post = Json::decode($request->getContent())) {
      $params = empty($params) ? $post : array_merge($params, $post);
    }

    $result = [];
    if (!empty($params)) {
      $manager = \Drupal::service('intercept_core.reservation.manager');
      $rooms = !empty($params['rooms']) ? $manager->convertIds($params['rooms']) : [];
      $result = $manager->availability([
        'start' => $params['start'],
        'end' => $params['end'],
        'duration' => $params['duration'],
        'rooms' => $rooms,
      ]);
    }

    return JsonResponse::create($result, 200);
  }
}
