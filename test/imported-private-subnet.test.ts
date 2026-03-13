import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as core from 'aws-cdk-lib/core';
import { ImportedPrivateSubnet, ImportedPrivateSubnetAttributes } from '../src/imported-private-subnet';

describe('ImportedPrivateSubnet', () => {
  let app: core.App;
  let stack: core.Stack;

  beforeEach(() => {
    app = new core.App();
    stack = new core.Stack(app, 'TestStack');
  });

  test('sets routeTable.routeTableId from attrs', () => {
    const attrs: ImportedPrivateSubnetAttributes = { routeTableId: 'rtb-abc123' };
    const subnet = new ImportedPrivateSubnet(stack, 'Subnet', attrs);

    expect(subnet.routeTable.routeTableId).toBe('rtb-abc123');
  });

  test('associateNetworkAcl throws Not implemented', () => {
    const subnet = new ImportedPrivateSubnet(stack, 'Subnet', { routeTableId: 'rtb-1' });
    const mockAcl = {} as ec2.INetworkAcl;

    expect(() => subnet.associateNetworkAcl('id', mockAcl)).toThrow('Not implemented');
  });
});
