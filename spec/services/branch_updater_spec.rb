RSpec.describe BranchUpdater, type: :model do
  subject(:branch_updater) do
    described_class.new(
      branch: branch,
      latest_metadata: latest_metadata
    )
  end
  let(:latest_metadata) do
    metadata_fixture(:branching)
  end
  let(:service) do
    MetadataPresenter::Service.new(
      latest_metadata
    )
  end

  describe '#metadata' do
    let(:branch) { Branch.new(attributes) }
    let(:default_next) { SecureRandom.uuid }
    let(:previous_flow_uuid) do
      '09e91fd9-7a46-4840-adbc-244d545cfef7'
    end
    let(:conditionals_attributes) do
      {
        '0' => {
          'next' => 'some-page-uuid',
          'expressions_attributes' => {
            '0' => {
              'operator' => 'is',
              'page' => 'another-page-uuid',
              'component' => 'some-component-uuid',
              'field' => 'some-field-uuid'
            }
          }
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
    let(:page_uuid) { 'another-page-uuid' }

    before do
      allow_any_instance_of(MetadataPresenter::Service)
        .to receive(:page_with_component)
        .with(component_uuid)
        .and_return(double(uuid: page_uuid))
    end

    context 'when metadata is valid' do
      let(:valid) { true }
      let(:flow_object) { branch_updater.metadata['flow'][previous_flow_uuid] }
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
            branch_updater.metadata, 'service.base'
          )
        ).to be(valid)
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
