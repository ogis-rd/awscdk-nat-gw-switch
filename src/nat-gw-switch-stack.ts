import * as nat from '@ogis-rd/awscdk-nat-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as core from 'aws-cdk-lib/core';
import { Construct, IDependable } from 'constructs';

export interface NatGwConfiguration {
  readonly publicSubnetId: string;
  readonly privateSubnetRouteTableIds: string[];
  readonly allocationId?: string;
}

export interface NatGwSwitchStackProps extends core.StackProps {
  readonly natGwConfigurations: NatGwConfiguration[];
}

export class NatGwSwitchStack extends core.Stack {
  constructor(scope: Construct, id: string, props: NatGwSwitchStackProps) {
    super(scope, id, props);

    if (props.natGwConfigurations.length < 1) {
      throw new Error('At least one NAT gateway configuration is required.');
    }

    props.natGwConfigurations.forEach((config, index) => {
      const suffix = `ForNatGateway${index + 1}`;

      const publicSubnet = ec2.PublicSubnet.fromSubnetId(this, `PublicSubnet${suffix}`,
        config.publicSubnetId,
      );

      const privateSubnets = config.privateSubnetRouteTableIds.map((routeTableId, routeTableIdIndex) => {
        return new ImportedPrivateSubnet(this, `PrivateSubnet${routeTableIdIndex + 1}${suffix}`, {
          routeTableId,
        });
      });

      const eip = config.allocationId
        ? nat.Eip.fromEipAttributes(this, `Eip${suffix}`, { eipAllocationId: config.allocationId })
        : undefined;

      new nat.DefaultPublicNatGateway(this, `DefaultPublicNatGateway${index + 1}`, {
        publicSubnet,
        privateSubnets,
        eip,
      });
    });
  }
}

interface ImportedPrivateSubnetAttributes {
  readonly routeTableId: string;
}

/**
 * A private subnet imported from route table ID (without subnet ID) for DefaultPublicNatGateway.
 */
class ImportedPrivateSubnet extends core.Resource implements ec2.IPrivateSubnet {
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
