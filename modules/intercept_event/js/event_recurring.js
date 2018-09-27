/**
 * @file
 * Provides JavaScript for recurring event node forms.
 */

(function ($, Drupal) {

/**
 * Provides a slimmer widget for recurring events.
 */
Drupal.behaviors.eventRecurring = {
  options: {},

  attach: function (context, settings) {
    var $root = this;
    $('.intercept-event-recurring-container', context).once().each(function(id, el) {
      $root.handle($(el).uniqueId(), context, settings);
    });
  },

  initialize: function($container, context, settings) {
    var $eventStartDate = $($container.data('start-date-selector')).val();
    var $eventEndDate = $($container.data('end-date-selector')).val();
    var $eventStartTime = $($container.data('start-time-selector')).val();
    var $eventEndTime = $($container.data('end-time-selector')).val();
    $container.find('.form-item-recurring-event-date-start-date .picker__input', context).val($eventStartDate);
    $container.find('.form-item-recurring-event-date-start-time .form-time', context).val($eventStartTime);
    $container.find('.form-item-recurring-event-date-end-date .picker__input', context).val($eventEndDate);
    $container.find('.form-item-recurring-event-date-end-time .form-time', context).val($eventEndTime);
  },

  populate: function($container, context, settings) {
    var elid = $container.attr('id');
    $root.options[elid] = {};

    var value = $container.find('.intercept-event-recurring-raw', context).val();
    var rrule = RRule.fromString(value);
    var options = rrule.options;
    $container.find('.intercept-event-recurring-value', context).each(function(vid, vel) {
      var $value = $(vel);
      var $dataName = $value.data('intercept-event-recurring-name');
      if ($dataName == 'until') {
        return;
      }
      // Skip freq because of a bug in material ui.
      if (options[$dataName] && $dataName != 'freq') {
        $value.val(options[$dataName]);
      }
    });
  },

  collect: function ($container, context, settings, clicked) {
    var elid = $container.attr('id');
    $root.options[elid] = {};

    var clicked_name = $(clicked).data('intercept-event-recurring-name');
    $container.find('.intercept-event-recurring-value', context).each(function(vid, vel) {
      var $value = $(vel);
      var $dataName = $value.data('intercept-event-recurring-name');
      if ($dataName) {
        if (clicked_name == 'count' && $dataName == 'until') {
          if ($root.options[elid]['until']) { delete $root.options[elid]['until']; }
          $value.val('');
        }
        if (clicked_name == 'until' && $dataName == 'count') {
          if ($root.options[elid]['count']) { delete $root.options[elid]['count']; }
          $value.val('');
        }
        var value = $value.val();
        if (value) {
          if ($dataName == 'until') {
            value = new Date(Date.parse($value.val()));
//            var day = value.getDate();
//            value.setDate(day + 1);
          }
          $root.options[elid][$dataName] = value;
        }
      }
    });

    var options = this.options[$container.attr('id')];
    var rule = new RRule(options);
    $container.find('.intercept-event-recurring-raw').val(rule.toString());
    $container.find('.intercept-event-recurring-readable').val(rule.toText());
  },

  bind: function ($container, context, settings) {
    $root = this;
    // Bind the enable button to populate values.
    $container.find('.intercept-event-recurring-enable').once().on('change', function() {
      if ($(this).is(':checked')) {
        $root.initialize($container, context);
      }
    });
    // Collect each value and update raw value on value updates.
    $container.find('.intercept-event-recurring-value', context).each(function(vid, vel) {
      var $value = $(vel);
      $value.once().on('change', function() {
        var $container = $(this).parents('.intercept-event-recurring-container');
        $root.collect($container, context, settings, this);
      });
    });
  },

  handle: function($container, context, settings) {
    var $root = this;
    $root.bind($container, context, settings);
    if ($container.find('.intercept-event-recurring-raw').val().length > 0) {
      $root.populate($container, context, settings);
    }
  },
};

})(jQuery, Drupal);
