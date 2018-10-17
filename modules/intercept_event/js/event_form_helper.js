/**
 * @file
 * Provides JavaScript for node edit/add forms.
 */

(function ($, Drupal) {

/**
 * Provides supporting JS for the node edit/add event forms.
 */
Drupal.behaviors.eventFormHelper = {
  attach: function (context, settings) {
    var $root = this;
    $('#edit-field-date-time-0-value-date').once().change(function() {
      var endDate = $('#edit-field-date-time-0-end-value-date');
      if ($(this).val() > endDate.val()) {
        endDate.val($(this).val());
        $('[name="field_date_time[0][end_value][date]"]').val($(this).val());
      }
    });
  },
};

})(jQuery, Drupal);
