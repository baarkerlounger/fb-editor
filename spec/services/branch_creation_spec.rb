RSpec.describe BranchCreation, type: :model do
  subject(:branch_creation) do
    described_class.new(branch: branch, latest_metadata: metadata)
  end
  let(:metadata) { metadata_fixture(:branching) }
  let(:service) do
    MetadataPresenter::Service.new(metadata)
  end

  describe '#branch_uuid' do
    let(:uuid) { SecureRandom.uuid }
    let(:branch) { Branch.new(attributes) }
    let(:new_flow_branch_generator) { double(uuid: uuid) }
    before do
      allow(NewFlowBranchGenerator).to receive(:new).and_return(new_flow_branch_generator)
    end
    let(:attributes) { {} }

    it 'should return the uuid of the new flow branch object' do
      expect(branch_creation.branch_uuid).to eq(uuid)
    end
  end

  describe '#metadata' do
    let(:branch) { Branch.new(attributes) }
    let(:default_next) { SecureRandom.uuid }
    let(:previous_flow_object) do
      metadata['pages'].find { |page| page['url'] == 'favourite-fruit' }
    end
    let(:previous_flow_uuid) { previous_flow_object['_uuid'] }
    let(:conditionals_attributes) do
      {
        '0' => {
          'next' => 'some-page-uuid',
          'expressions_attributes' => {
            '0' => {
              'operator' => 'is',
              'page' => page_uuid,
              'component' => component_uuid,
              'field' => 'some-field-uuid'
            }
          }
        }
      }
    end
    let(:params) do
      {
        branch: {
          flow_uuid: previous_flow_uuid,
          conditionals_attributes: conditionals_attributes
        }
      }
    end
    let(:attributes) do
      {
        service: service,
        previous_flow_uuid: previous_flow_uuid,
        conditionals_attributes: conditionals_attributes,
        default_next: default_next
      }
    end
    let(:component_uuid) { 'some-component-uuid' }
    let(:page_uuid) { 'another-page-uuid'}

    before do
      allow_any_instance_of(MetadataPresenter::Service)
        .to receive(:page_with_component)
        .with(component_uuid)
        .and_return(double(uuid: page_uuid))
    end

    context 'when metadata is valid' do
      let(:valid) { true }
      let(:flow_object) { branch_creation.metadata['flow'][branch_creation.branch_uuid] }
      let(:expected_conditionals) do
        [
          {
            '_type' => 'if',
            'next' => 'some-page-uuid',
            'expressions' => [
              {
                'operator' => 'is',
                'page' => page_uuid,
                'component' => component_uuid,
                'field' => 'some-field-uuid'
              }
            ]
          }
        ]
      end

      it 'creates valid service metadata' do
        expect(
          MetadataPresenter::ValidateSchema.validate(
            branch_creation.metadata, 'service.base'
          )
        ).to be(valid)
      end

      it 'updates previous page adding the branch as default next' do
        allow(SecureRandom).to receive(:uuid).and_return(
          '2db31ab2-8238-4545-8a81-dd4874b940f2'
        )
        service = MetadataPresenter::Service.new(branch_creation.metadata)
        expect(
          service.flow_object(previous_flow_uuid)['next']['default']
        ).to eq('2db31ab2-8238-4545-8a81-dd4874b940f2')
      end

      it 'updates the service flow with the correct default next' do
        expect(flow_object['next']['default']).to eq(default_next)
      end

      it 'updates the service flow with the correct conditionals' do
        expect(flow_object['next']['conditionals']).to eq(expected_conditionals)
      end
    end
  end
end
