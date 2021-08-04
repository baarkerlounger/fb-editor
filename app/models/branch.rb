class Branch
  include ActiveModel::Model
  attr_accessor :previous_flow_uuid, :service, :default_next

  validate :conditionals_validations

  def self.from_metadata(flow_object)
    conditionals_hash = { 'conditionals_attributes' => {} }

    flow_object.conditionals.each_with_index do |conditional, index|
      conditionals_hash['conditionals_attributes'][index.to_s] = {
        'next' => conditional.next
      }.merge(expressions_attributes(conditional))
    end

    conditionals_hash
  end

  def self.expressions_attributes(conditional)
    expressions_hash = { 'expressions_attributes' => {} }

    conditional.expressions.each_with_index do |expression, expression_index|
      expressions_hash['expressions_attributes'][expression_index.to_s] = {
        'page' => expression.page,
        'component' => expression.component,
        'field' => expression.field
      }
    end

    expressions_hash
  end

  def conditionals_validations
    errors.add(:conditionals, 'Conditionals are not valid') if conditionals.map(&:invalid?).any?
  end

  def conditionals
    @conditionals ||= []
  end

  def conditionals_attributes=(hash)
    hash.each do |_index, conditional_hash|
      conditionals.push(Conditional.new(conditional_hash.merge(service: service)))
    end
  end

  def pages
    service.pages.map { |page| [page.title, page.uuid] }
  end

  def previous_questions
    results = previous_pages.map do |page|
      components = Array(page.components).select(&:supports_branching?)

      components.map do |component|
        [component.humanised_title, component.uuid]
      end
    end

    results.flatten(1)
  end

  def previous_flow_title
    previous_flow_object.title
  end

  def previous_pages
    MetadataPresenter::TraversedPages.new(
      service,
      {},
      previous_flow_object
    ).all.push(previous_flow_object)
  end

  def previous_flow_object
    service.find_page_by_uuid(previous_flow_uuid) ||
      service.flow_object(previous_flow_uuid)
  end
end
