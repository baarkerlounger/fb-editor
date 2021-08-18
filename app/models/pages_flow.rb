class PagesFlow
  def initialize(service)
    @service = service
  end

  def build
    service.flow_objects.map { |flow| send(flow.type.gsub('flow.', ''), flow) }
  rescue NoMethodError
    # do something here
  end

  def page(flow)
    page = service.find_page_by_uuid(flow.uuid)
    base_props(page).merge(next: flow.default_next)
  end

  def branch(flow)
    base_props(flow).merge(
      conditionals: branch_conditionals(
        flow.conditionals
      ).push(otherwise(flow.default_next))
    )
  end

  private

  attr_reader :service

  def base_props(obj)
    {
      type: obj.type,
      title: obj.title,
      uuid: obj.uuid
    }
  end

  def branch_conditionals(conditionals)
    conditionals.map { |conditional|
      send("#{conditional.type}_conditional", conditional)
    }.flatten
  rescue NoMethodError
    # do something here
  end

  def if_conditional(conditional)
    {
      next: conditional.next,
      expressions: conditional_expressions(conditional)
    }
  end
  alias_method :and_conditional, :if_conditional

  def or_conditional(conditional)
    conditional.expressions.map do |expression|
      {
        next: conditional.next,
        expressions: [question_and_answer(expression)]
      }
    end
  end

  def conditional_expressions(conditional)
    conditional.expressions.map do |expression|
      question_and_answer(expression)
    end
  end

  def question_and_answer(expression)
    page = service.find_page_by_uuid(expression.page)
    component = page.find_component_by_uuid(expression.component)
    item = component.find_item_by_uuid(expression.field) if expression.field.present?
    operator = I18n.t("operators.#{expression.operator}")

    {
      question: component.humanised_title,
      answer: "#{operator} #{item&.label || ''}".strip
    }
  end

  def otherwise(default_next)
    {
      next: default_next,
      expressions: [
        {
          question: I18n.t('activemodel.attributes.branch.default_next'),
          answer: ''
        }
      ]
    }
  end
end
