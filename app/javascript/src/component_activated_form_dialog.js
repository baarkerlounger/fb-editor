/**
 * Activated Form Dialog Component
 * ----------------------------------------------------
 * Description:
 * Wraps a form in Activated Dialog effect.
 * Clears errors on close/cancel, if they are shown.
 *
 * Documentation:
 *
 *     - jQueryUI
 *       https://api.jqueryui.com/dialog
 *
 *     - TODO:
 *       (steven.burnell@digital.justice.gov.uk to add).
 *
 **/


const ActivatedDialog = require('./component_activated_dialog');
const utilities = require('./utilities');
const mergeObjects = utilities.mergeObjects;


class ActivatedFormDialog extends ActivatedDialog {
  constructor($form, config) {
    var $errors = $form.find(".govuk-error-message");
    $form.before(config.activator); // We need to move before invoking any jQueryUI dialog.

    super($form, mergeObjects( config, {
      autoOpen: $errors.length ? true: false,
      cancelText: config.cancelText,
      okText: config.activator.val(),
      activator: config.activator,
      onOk: () => {
        this.$form.submit();
      },
      onClose: () => {
        this.clearErrors();
      }
    }));

    // Change inherited class name to reflect this Class
    $form.parents(".ActivatedDialog")
      .removeClass("ActivatedDialog")
      .addClass("ActivatedFormDialog");

    this.$form = $form;
    this.$errors = $errors;
  }

  clearErrors() {
    this.$errors.parents().removeClass("govuk-form-group--error");
    this.$errors.remove();
  }
}


module.exports = ActivatedFormDialog;
