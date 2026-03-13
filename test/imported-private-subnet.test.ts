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

  test('unavailable properties and methods throw', () => {
    const subnet = new ImportedPrivateSubnet(stack, 'Subnet', { routeTableId: 'rtb-1' });

    expect(() => subnet.availabilityZone).toThrow('Not accessible');
    expect(() => subnet.internetConnectivityEstablished).toThrow('Not accessible');
    expect(() => subnet.ipv4CidrBlock).toThrow('Not accessible');
    expect(() => subnet.subnetId).toThrow('Not accessible');
    expect(() => subnet.associateNetworkAcl('id', {} as any)).toThrow('Not implemented');
  });
});
