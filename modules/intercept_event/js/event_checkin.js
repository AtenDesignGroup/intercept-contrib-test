/**
 * @file
 * Provides JavaScript for Inline Entity Form.
 */

(function ($, Drupal) {

/**
 * Allows submit buttons in entity forms to trigger uploads by undoing
 * work done by Drupal.behaviors.fileButtons.
 */
Drupal.behaviors.eventCheckinForm = {
  attach: function (context, settings) {
    var $success = $(".messages--status:contains('" + $.escapeSelector(settings.eventCheckinMessage) + "')");
    if ($success.length) {
      setTimeout(function () {
        $success.animate({
          opacity: 0,
          height: 0,
        }, 1000)}, 3000)
    }
  },
};

})(jQuery, Drupal);
