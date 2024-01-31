import { Template } from 'aws-cdk-lib/assertions';
import * as core from 'aws-cdk-lib/core';
import { NatGwSwitchStack, NatGwSwitchStackProps } from '../src/nat-gw-switch-stack';

describe('NatGwSwitchStack', () => {
  let app: core.App;

  beforeEach(() => {
    app = new core.App();
  });

  test.each([
    { routeTableIds: ['rtb-1'], allocationId: undefined },
    { routeTableIds: ['rtb-1'], allocationId: 'eipalloc-1' },
    { routeTableIds: ['rtb-1', 'rtb-2'], allocationId: undefined },
    { routeTableIds: ['rtb-1', 'rtb-2'], allocationId: 'eipalloc-1' },
  ])('1 NATGW with EIP ($allocationId) for $routeTableIds.length RouteTable', ({ routeTableIds, allocationId }) => {
    const publicSubnetId = 'subnet-1';
    const props: NatGwSwitchStackProps = {
      natGwConfigurations: [
        {
          publicSubnetId,
          privateSubnetRouteTableIds: routeTableIds,
          allocationId,
        },
      ],
    };

    const stack = new NatGwSwitchStack(app, 'Stack', props);
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::NatGateway', 1);
    template.resourcePropertiesCountIs('AWS::EC2::NatGateway', {
      SubnetId: publicSubnetId,
      ConnectivityType: 'public',
    }, 1);

    template.resourceCountIs('AWS::EC2::Route', routeTableIds.length);
    routeTableIds.forEach(routeTableId => {
      template.resourcePropertiesCountIs('AWS::EC2::Route', {
        RouteTableId: routeTableId,
        DestinationCidrBlock: '0.0.0.0/0',
      }, 1);
    });

    template.resourceCountIs('AWS::EC2::EIP', (allocationId ? 0 : 1));
  });

  test('Multiple NATGWs', () => {
    const props: NatGwSwitchStackProps = {
      natGwConfigurations: [
        { publicSubnetId: 'subnet-1', privateSubnetRouteTableIds: ['rtb-1'], allocationId: undefined },
        { publicSubnetId: 'subnet-1', privateSubnetRouteTableIds: ['rtb-2'], allocationId: 'eipalloc-1' },
        { publicSubnetId: 'subnet-2', privateSubnetRouteTableIds: ['rtb-3', 'rtb-4'], allocationId: undefined },
        { publicSubnetId: 'subnet-2', privateSubnetRouteTableIds: ['rtb-5', 'rtb-6'], allocationId: 'eipalloc-2' },
      ],
    };

    const stack = new NatGwSwitchStack(app, 'Stack', props);
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::NatGateway', props.natGwConfigurations.length);
    template.resourcePropertiesCountIs('AWS::EC2::NatGateway', {
      SubnetId: 'subnet-1',
      ConnectivityType: 'public',
    }, 2);
    template.resourcePropertiesCountIs('AWS::EC2::NatGateway', {
      SubnetId: 'subnet-2',
      ConnectivityType: 'public',
    }, 2);

    const routeTableCount = props.natGwConfigurations
      .map(setting => setting.privateSubnetRouteTableIds.length)
      .reduce((prev, current) => { return prev + current; });
    template.resourceCountIs('AWS::EC2::Route', routeTableCount);
    props.natGwConfigurations.forEach(setting => {
      setting.privateSubnetRouteTableIds.forEach(routeTableId => {
        template.resourcePropertiesCountIs('AWS::EC2::Route', {
          RouteTableId: routeTableId,
          DestinationCidrBlock: '0.0.0.0/0',
        }, 1);
      });
    });

    const eipCount = props.natGwConfigurations
      .map(setting => (setting.allocationId ? 1 : 0) as number)
      .reduce((prev, current) => { return prev + current; });
    template.resourceCountIs('AWS::EC2::EIP', eipCount);
  });

  test('No NATGWs', () => {
    const props: NatGwSwitchStackProps = {
      natGwConfigurations: [],
    };

    expect(() => {
      new NatGwSwitchStack(app, 'Stack', props);
    }).toThrow('At least one NAT gateway configuration is required.');
  });
});
