import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as core from 'aws-cdk-lib/core';
import { Construct, IDependable } from 'constructs';

export interface ImportedPrivateSubnetAttributes {
  readonly routeTableId: string;
}

/**
 * A private subnet imported from route table ID (without subnet ID) for DefaultPublicNatGateway.
 */
export class ImportedPrivateSubnet extends core.Resource implements ec2.IPrivateSubnet {
  public readonly routeTable: ec2.IRouteTable;

  // DefaultPublicNatGateway will not use these properties.
  // In case they are accessed, throw Error and notify users of it.
  /* istanbul ignore next */
  public get availabilityZone(): string { throw new Error('Not accessible'); }
  /* istanbul ignore next */
  public get internetConnectivityEstablished(): IDependable { throw new Error('Not accessible'); }
  /* istanbul ignore next */
  public get ipv4CidrBlock(): string { throw new Error('Not accessible'); }
  /* istanbul ignore next */
  public get subnetId(): string { throw new Error('Not accessible'); }

  constructor(scope: Construct, id: string, attrs: ImportedPrivateSubnetAttributes) {
    super(scope, id);

    this.routeTable = {
      routeTableId: attrs.routeTableId,
    };
  }

  public associateNetworkAcl(_id: string, _networkAcl: ec2.INetworkAcl): void {
    /* istanbul ignore next */
    throw new Error('Not implemented');
  }
}
