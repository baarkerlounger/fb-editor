require("./setup");

describe("Branch", function () {

  const Branch = require('../app/javascript/src/component_branch.js');
  const COMPONENT_ID = "testing-branch";
  const BRANCH_DESTINATION_SELECTOR = ".destination";
  const BRANCH_CONDITION_SELECTOR = ".condition";
  const BRANCH_QUESTION_SELECTOR = ".question";
  const BRANCH_ANSWER_SELECTOR = ".answer";
  const EXPRESSION_URL = "something/goes/here";
  const INDEX_BRANCH = 4;
  const INDEX_CONDITION = 2;
  var branch;

  before(function() {
    var $html = $(`<div class="branch" id="` + COMPONENT_ID + `" data-branch-index="` + INDEX_BRANCH  + `">
      <p>Branch ...</p>
      <div class="destination">
        <div class="form-group">
          <label for="branch_next">Go to</label>
          <select id="branch_next">
            <option value="">--- Select a destination page ---</option>
            <option value="618a037b">Service name goes here</option>
            <option value="088dcdbe">Question</option>
            <option value="4d707045">Title</option>
          </select>
        </div>
      </div>
      <div class="condition" data-condition-index="` + INDEX_CONDITION  + `">
        <div class="question">
          <label for="branch_1">If</label>
          <select id="branch_1">
            <option value="">--Select a question--</option>
            <option value="a24f492b" data-supports-branching="true">Supported Question</option>
            <option value="b34f593a" data-supports-branching="false">Unsupported Question</option>
          </select>
        </div>
      </div>
    </div>`);

    $(document.body).append($html);
    branch = new Branch($html, {
      condition_selector: BRANCH_CONDITION_SELECTOR,
      destination_selector: BRANCH_DESTINATION_SELECTOR,
      question_selector: BRANCH_QUESTION_SELECTOR,
      expression_url: EXPRESSION_URL,
      attribute_branch_index: "branch-index",
      attribute_condition_index: "condition-index",
      view: {
        text: "Something, something, something... darkside."
      }
    });
  });


  describe("Component", function() {
    it("should have the basic HTML in place", function() {
      expect($("#" + COMPONENT_ID).length).to.equal(1);
    });

    it("should have the component class name present", function() {
      expect($("#" + COMPONENT_ID).hasClass("Branch")).to.be.true;
    });

    it("should make the $node public", function() {
      expect(branch.$node).to.exist;
      expect(branch.$node.length).to.equal(1);
      expect(branch.$node.attr("id")).to.equal(COMPONENT_ID);
    });

    it("should make the instance available as data on the $node", function() {
      var instance = $("#" + COMPONENT_ID).data("instance");
      expect(instance.$node).to.exist;
      expect(instance.$node.length).to.equal(1);
      expect(instance.$node.attr("id")).to.equal(COMPONENT_ID);
    });

    it("should make the view public", function() {
      expect(branch.view).to.exist;
      expect(branch.view.text).to.equal("Something, something, something... darkside.");
    });

    it("should make the destination public", function() {
      expect(branch.destination).to.exist;
    });

    it("should make the condition public", function() {
      expect(branch.condition).to.exist;
    });

    it("should make (public but indicated as) private reference to config", function() {
      expect(branch._config).to.exist;
      expect(branch._config.condition_selector).to.equal(BRANCH_CONDITION_SELECTOR);
    });

    it("should assign an index value and make public", function() {
      var instance = branch.$node.data("instance");
      expect(instance.index).to.equal(INDEX_BRANCH);
    });
  });

  describe("BranchDestination", function() {
    var $destination;

    beforeEach(function() {
      $destination = $(BRANCH_DESTINATION_SELECTOR);
    });

    it("should have the basic HTML in place", function() {
      // TODO: Not sure if this is useful at this point but complexity
      // may develop with a greater need for increased checks over time.
      expect($destination.length).to.equal(1);
      expect($destination.get(0).nodeName.toLowerCase()).to.equal("div");
    });

    it("should have the component class name present", function() {
      expect($destination.hasClass("BranchDestination")).to.be.true;
    });

    it("should make the instance available as data on the $node", function() {
      var instance = $destination.data("instance");
      expect(instance).to.exist;
      expect(branch.destination).to.equal(instance);
    });

    it("should make the $node public", function() {
      var instance = $destination.data("instance");
      expect(instance.$node).to.exist;
      expect(instance.$node.length).to.equal(1);
      expect(instance.$node.get(0)).to.equal($destination.get(0));
    });

    it("should make (public but indicated as) private reference to config", function() {
      var instance = $destination.data("instance");
      expect(instance._config).to.exist;
      expect(instance._config.destination_selector).to.equal(BRANCH_DESTINATION_SELECTOR);
    });
  });

  describe("BranchCondition", function() {
    var $condition;

    before(function() {
      $condition = $(BRANCH_CONDITION_SELECTOR);
    });

    it("should have the basic HTML in place", function() {
      // Just adding something basic here but it might change.
      expect($condition.length).to.equal(1);
      expect($condition.get(0).nodeName.toLowerCase()).to.equal("div");
    });

    it("should have the component class name present", function() {
      expect($condition.hasClass("BranchCondition")).to.be.true;
    });

    it("should make the $node public", function() {
      var instance = $condition.data("instance");
      expect(instance.$node).to.exist;
      expect(instance.$node.length).to.equal(1);
      expect(instance.$node.get(0)).to.equal($condition.get(0));
    });

    it("should make (public but indicated as) private reference to config", function() {
      var instance = $condition.data("instance");
      expect(instance._config).to.exist;
      expect(instance._config.condition_selector).to.equal(BRANCH_CONDITION_SELECTOR);
    });

    it("should assign an index value and make public", function() {
      var instance = $condition.data("instance");
      expect(instance.index).to.equal(INDEX_CONDITION);
    });

    describe("update", function() {
      var get;
      beforeEach(function() {
        // Hijack $.get to fake a response
        get = $.get;
        $.get = function(urlNotNeeded, response) {
          response(`<div class="answer">
            <select><option>is</option></select>
            <select><option>This answer value</option></select>
          </div>`);
        }
      });

      afterEach(function() {
         // Reset to original function
         branch.condition.$node.find(BRANCH_ANSWER_SELECTOR).remove();
         $.get = get;
      });

      it("should add html for answer on selected question", function() {
        var condition = $condition.data("instance");

        expect($condition).to.exist;
        expect($condition.length).to.equal(1);
        expect($condition.find(BRANCH_ANSWER_SELECTOR).length).to.equal(0);

        expect(condition).to.exist;
        condition.update("component-id-here");
        expect($condition.find(BRANCH_ANSWER_SELECTOR).length).to.equal(1);
      });
    });

    describe("clear", function() {
      it("should remove html for answer", function() {
        var condition = $condition.data("instance");
        expect(condition).to.exist;
        expect($condition).to.exist;
        expect($condition.length).to.equal(1);

        // Fake an existing Answer element.
        condition.answer = {
          $node: $("<div class=\"answer BranchAnswer\"></div>")
        }

        $condition.append(condition.answer.$node);
        expect($condition.find(BRANCH_ANSWER_SELECTOR).length).to.equal(1);

        condition.clear();
        expect($condition.find(BRANCH_ANSWER_SELECTOR).length).to.equal(0);
      });
    });
  });

  describe("BranchQuestion", function() {
    var $question;

    beforeEach(function() {
      $question = $(BRANCH_QUESTION_SELECTOR);
    });

    it("should have the basic HTML in place", function() {
      // Just adding something basic here but it might change.
      expect($question.length).to.equal(1);
      expect($question.get(0).nodeName.toLowerCase()).to.equal("div");
    });

    it("should have the component class name present", function() {
      expect($question.hasClass("BranchQuestion")).to.be.true;
    });

    it("should make the $node public", function() {
      var instance = $question.data("instance");
      expect(instance.$node).to.exist;
      expect(instance.$node.length).to.equal(1);
      expect(instance.$node.get(0)).to.equal($question.get(0));
    });

    it("should make (public but indicated as) private reference to config", function() {
      var instance = $question.data("instance");
      expect(instance._config).to.exist;
      expect(instance._config.question_selector).to.equal(BRANCH_QUESTION_SELECTOR);
    });

    it("should clear error on change of question", function() {
      var instance = $question.data("instance");
      var $error = $("<p class=\"error-message\"></p>");
      instance._$error = $error;
      $question.append($error);

      // Check it's all there...
      expect($question.find(".error-message").length).to.equal(1);
      expect(instance._$error).to.exist;
      expect(instance._$error).to.equal($error);

      // now activate the method...
      instance.clear();

      // and check it's all gone.
      expect(instance._$error).to.not.equal($error);
      expect(instance._$error).to.not.exist;
      expect($question.find(".error-message").length).to.equal(0);
    });

    it("should call condition.update on selectiom of supported question", function() {
      var $branch =  $(`<div class="branch" data-branch-index="3">
        <div class="destination">
        </div>
        <div class="condition" data-condition-index="5">
          <div class="question">
            <select>
              <option value="b34f593a" data-supports-branching="true">Unsupported Question</option>
            </select>
          </div>
        </div>
      </div>`);

      var branch = new Branch($branch, {
        destination_selector: ".destination",
        condition_selector: ".condition",
        question_selector: ".question",
        attribute_branch_index: "data-branch-index",
        attribute_condition_index: "data-condition-index",
        expression_url: "/not/needed"
      });

      var check = 1;

      expect(check).to.equal(1);

      // Overwrite the method on instance to easily detect activation in a test.
      branch.condition.update = function() {
        check += 1;
      }

      // This line doesn't work...
      // branch.condition.$node.find("option").click();
      // ...so calling change() method directly with passed select node.
      branch.condition.question.change(branch.$node.find("select").get(0));
      expect(check).to.equal(2);
    });

    it("should show an error on selection of unsupported question", function() {
      var $branch =  $(`<div class="branch" data-branch-index="3">
        <div class="destination">
        </div>
        <div class="condition" data-condition-index="5">
          <div class="question">
            <select>
              <option value="b34f593a" data-supports-branching="false">Unsupported Question</option>
            </select>
          </div>
        </div>
      </div>`);

      var errorMessage = "This is an error message";
      var branch = new Branch($branch, {
        destination_selector: ".destination",
        condition_selector: ".condition",
        question_selector: ".question",
        attribute_branch_index: "data-branch-index",
        attribute_condition_index: "data-condition-index",
        expression_url: "/not/needed",
        view: {
          text: {
            errors: {
              branches: {
                unsupported_question: errorMessage
              }
            }
          }
        }
      });

      // First check error does not exist
      expect(branch.condition.question._$error).to.not.exist;
      expect(branch.condition.$node.find(".error-message").length).to.equal(0);
      expect(branch.condition.$node.hasClass("error")).to.be.false;

      branch.condition.question.change(branch.$node.find("select").get(0));
      let $error = $branch.find(".error-message");

      // Now check error stuff is where it needs to be.
      expect($error).to.exist;
      expect($error.length).to.equal(1);
      expect($error.text()).to.equal(errorMessage);
      expect(branch.condition.question._$error).to.exist;
      expect(branch.condition.question._$error.length).to.equal(1);
      expect(branch.condition.$node.hasClass("error")).to.be.true;
    });
  });

  describe("BranchAnswer", function() {
    var $answer, get;

    before(function() {

      // Hijack $.get to fake a response
      get = $.get;
      $.get = function(urlNotNeeded, response) {
        response(`<div class="answer">
          <select><option>is</option></select>
          <select><option>This answer value</option></select>
        </div>`);
      }

      // Set the answer node and create a BranchAnswer by calling update() function
      $(BRANCH_CONDITION_SELECTOR).data("instance").update("asdfdfa");
      $answer = branch.$node.find(BRANCH_ANSWER_SELECTOR);
    });

    after(function() {
       // Reset to original function
       $answer.remove();
       $.get = get;
    });

    it("should have the basic HTML in place", function() {
      // Just adding something basic here but it might change.
      expect($answer.length).to.equal(1);
      expect($answer.get(0).nodeName.toLowerCase()).to.equal("div");
    });

    it("should have the component class name present", function() {
      expect($answer.hasClass("BranchAnswer")).to.be.true;
    });

    it("should make the $node public", function() {
      var instance = $answer.data("instance");
      expect(instance.$node).to.exist;
      expect(instance.$node.length).to.equal(1);
      expect(instance.$node.get(0)).to.equal($answer.get(0));
    });

    it("should make (public but indicated as) private reference to config", function() {
      var instance = $answer.data("instance");
      expect(instance._config).to.exist;
      expect(instance._config.expression_url).to.equal(EXPRESSION_URL);
    });
  });
});
