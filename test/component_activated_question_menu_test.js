require("./setup");
const expect = require("chai").expect;

describe("QuestionMenu", function() {

  const QuestionMenu = require("../app/javascript/src/component_activated_question_menu");
  const COMPONENT_CLASSNAME = "QuestionMenu";
  const CONTAINER_ID = "activated-question-menu-test-container-id";
  const CONTAINER_CLASSNAME = "activated-question-menu-test-classname and-another-activated-menu-classname";
  const ACTIVATOR_CLASSNAME = "activated-question-menu-activator-test-classname";
  const ACTIVATOR_ID = "activated-question-menu-test-activator-id";
  const ACTIVATOR_TEXT = "activated question menu activator";
  const MENU_ID = "activated-question-menu-test-menu-id";
  const TEST_SELECTION_ELEMENT_ID = "component-activated-question-menu-test-selection-event-element";
  const TEST_SELECTION_EVENT_NAME = "QuestionMenuTestSelectionEventName";
  var menu, question;

  /* Function to manually simulate closed state menu in
   * case any test leaves open when that is not required.
   **/
  function simulateClosed(menu) {
    menu._state.open = false;
    menu.container.$node.get(0).style.display = "none";
    menu.activator.$node.removeClass("active");
  }

  /* Function to fake a generic question good enough
   * only for testing purpose.
   **/
  function FakeQuestionClass() {
    var $node = $("<div></div>")
    $node.addClass("Question FakeQuestion");
    $(document.body).append($node);
    this.$node = $node;
    this.data = {
      validation: {
        required: false
      }
    }
  }

  before(function() {
    // jQuery is present in document because the
    // components use it so we can use it here.

    var $ul = $(`<ul>
                   <li data-action="required"><span>Required</span></li>
                   <li data-action="remove"><span>Remove</span></li>
                   <li data-action="detonate"><span>Detonate</span></li>
                 </ul>`);

    var question = new FakeQuestionClass();

    $(document.body).append($ul);

    $ul.attr("id", MENU_ID);
    menu = new QuestionMenu ($ul, {
      activator_classname: ACTIVATOR_CLASSNAME,
      activator_text: ACTIVATOR_TEXT,
      question: question,

      container_id: CONTAINER_ID,
      container_classname: CONTAINER_CLASSNAME,
      selection_event: TEST_SELECTION_EVENT_NAME
    });
  });

  after(function() {
    menu.question.$node.remove();
    menu.question = null;
    menu.$node.menu("destroy");
    menu.$node.remove();
    menu.activator.$node.remove();
    menu.container.$node.remove();
    menu = null;
  });

  describe("QuestionMenu", function() {
    it("should have the basic HTML in place", function() {
      expect($("#" + MENU_ID).length).to.equal(1);
    });

    it("should have the component class name present", function() {
      expect($("#" + MENU_ID).parent().hasClass(COMPONENT_CLASSNAME)).to.be.true;
    });

    it("should make the $node public", function() {
      expect(menu.$node).to.exist;
      expect(menu.$node.length).to.equal(1);
    });

    it("should make the question public", function() {
      expect(menu.question).to.exist;
      expect(menu.question.$node.length).to.equal(1);
    });

    it("should make the activator public", function() {
      expect(menu.activator).to.exist;
    });

    it("should make the container public", function() {
      expect(menu.container).to.exist;
    });

    it("should make the instance available as data on the $node", function() {
      expect(menu.$node.data("instance")).to.exist;
      expect(menu.$node.data("instance")).to.equal(menu);
    });

    it("should make (public but indicated as) private reference to config", function() {
      expect(menu._config).to.exist;
      expect(menu._config.question).to.exist;
    });

    it("should make (public but indicated as) private reference to position", function() {
      expect(menu._position).to.exist;
      expect(menu._position.my).to.exist;
      expect(menu._position.my).to.equal("left top");
      expect(menu._position.at).to.exist;
      expect(menu._position.at).to.equal("left bottom");
      expect(menu._position.of).to.exist;
    });

    it("should make (public but indicated as) private reference to state", function() {
      expect(menu._state).to.exist;
      expect(menu._state.open).to.exist;
    });

    it("should open the menu by the open() method", function() {
      simulateClosed(menu);
      expect(menu.container.$node.get(0).style.display).to.equal("none");

      menu.open();
      expect(menu.container.$node.get(0).style.display).to.equal("");
    });

    it("should set the state.open to true when open() is activated", function() {
      simulateClosed(menu);
      expect(menu._state.open).to.be.false;

      menu.open();
      expect(menu._state.open).to.be.true;
    });

    it("should add the class 'active' to the activator on open()", function() {
      simulateClosed(menu);

      expect(menu._state.open).to.be.false;
      expect(menu.activator.$node.hasClass("active")).to.be.false;

      menu.open();
      expect(menu.activator.$node.hasClass("active")).to.be.true;
    });

    /* TODO: Test is on hold because we cannot use jsDom
     * for testing position of elements
     **/
    it("should set the position values passed in open()");

    it("should close the menu by the close() method", function() {
      menu.open();
      expect(menu.container.$node.get(0).style.display).to.equal("");

      menu.close();
      expect(menu.container.$node.get(0).style.display).to.equal("none");
    });

    it("should set the state.open to false when close() is activated", function() {
      menu.open();
      expect(menu._state.open).to.be.true;

      menu.close();
      expect(menu._state.open).to.be.false;
    });

    it("should remove the class 'active' from the activator on close()", function() {
      menu.open();
      expect(menu.activator.$node.hasClass("active")).to.be.true;

      menu.close();
      expect(menu.activator.$node.hasClass("active")).to.be.false;
    });

    /* TODO: Test is on hold because we cannot use jsDom
     * for testing position of elements
     */
    it("should reset the position values on close()");

    /* TODO: Test is on hold because we cannot use jsDom
     * for testing mouse events
     **/
    it("should close the menu on mouseout (not sure if can test)");
  });

  describe("Actions", function() {
    it("should trigger QuestionMenuSelectionRemove event on remove()", function() {
      var value = 1;
      var $target;

      $(document).on("QuestionMenuSelectionRemove", function() {
        value += 1;
      });

      expect(value).to.equal(1);

      $target = menu.$node.find("li[data-action=remove]");
      expect($target.length).to.equal(1);

      $target.click();
      expect(value).to.equal(2);
    });

    it("should trigger QuestionMenuSelectionRequired event on required()", function() {
      var value = 1;
      var $target;

      $(document).on("QuestionMenuSelectionRequired", function() {
        value += 1;
      });

      expect(value).to.equal(1);

      $target = menu.$node.find("li[data-action=required]");
      expect($target.length).to.equal(1);

      $target.click();
      expect(value).to.equal(2);
    });
  });

  describe("setRequiredViewState()", function() {
    it("should add class 'on' to required item when required is true", function() {
      var $target = menu.$node.find("li[data-action=required]");
      expect($target.hasClass("on")).to.be.false;

      menu.question.data.validation.required = true;
      menu.setRequiredViewState()
      expect($target.hasClass("on")).to.be.true;
    });

    it("should remove class 'on' for required item when required is false", function() {
      var $target = menu.$node.find("li[data-action=required]");

      $target.addClass("on");
      expect($target.hasClass("on")).to.be.true;

      menu.question.data.validation.required = false;
      menu.setRequiredViewState()
      expect($target.hasClass("on")).to.be.false;
    });
  });

  describe("ActivatedMenuContainer", function() {
    it("should apply the config.container_id to $node", function() {
      expect(menu.container.$node.attr("id")).to.equal(CONTAINER_ID);
    });

    it("should apply the config.container_classname to $node", function() {
      var classes = CONTAINER_CLASSNAME.split(" ");
      for(var i=0; i<classes.length; ++i) {
        expect(menu.container.$node.hasClass(classes[i])).to.be.true;
      }
    });

    it("should add the Container to the DOM", function() {
      var $node = $("#" + CONTAINER_ID);
      expect($node).to.exist;
      expect($node.length).to.equal(1);
    });

    it("should wrap the original menu element", function() {
      expect(menu.$node.parent().attr("id")).to.equal(CONTAINER_ID);
    });

    it("should make the menu public", function() {
      expect(menu.container.menu).to.exist;
      expect(menu.container.menu).to.equal(menu);
    });

    it("should make the $node public", function() {
      expect(menu.container.$node).to.exist;
      expect(menu.container.$node.length).to.equal(1);
    });

    it("should make the instance available as data on the $node", function() {
      expect(menu.container.$node.data("instance")).to.exist;
      expect(menu.container.$node.data("instance")).to.equal(menu.container);
    });
  });

  describe("ActivatedMenuActivator (passed)", function() {
    it("should create an activator", function() {
      expect(menu.activator).to.exist;
      expect(menu.activator.$node).to.exist;
      expect(menu.activator.$node.length).to.equal(1);
    });

    it("should make the $node public", function() {
      expect(menu.activator.$node).to.exist;
      expect(menu.activator.$node.length).to.equal(1);
    });

    it("should make the menu public", function() {
      expect(menu.activator.menu).to.exist;
      expect(menu.activator.menu).to.equal(menu);
    });

    it("should make the instance available as data on the $node", function() {
      expect(menu.activator.$node.data("instance")).to.exist;
      expect(menu.activator.$node.data("instance")).to.equal(menu.activator);
    });

    it("should use config.activator_text for any created activator", function() {
      expect(menu._config).to.exist;
      expect(menu._config.activator_text).to.exist;
      expect(menu._config.activator_text).to.equal(ACTIVATOR_TEXT);
      expect(menu.activator.$node.text()).to.equal(ACTIVATOR_TEXT);
    });

    it("should apply config.activator_classname to any created activator", function() {
      expect(menu.activator).to.exist;
      expect(menu.activator.$node).to.exist;
      expect(menu.activator.$node.length).to.equal(1);
      expect(menu.activator.$node.hasClass(ACTIVATOR_CLASSNAME)).to.be.true;
    });

    it("should open the menu when activator is clicked", function() {
      // TODO... 
//      menu.activator.$node.click();
      //expect(1).to.equal(0); // Fail until done.
    });
  });
});
