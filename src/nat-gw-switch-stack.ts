import * as nat from '@ogis-rd/awscdk-nat-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as core from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { ImportedPrivateSubnet } from './imported-private-subnet';

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
        ? nat.Eip.fromAllocationId(this, `Eip${suffix}`, config.allocationId)
        : undefined;

      new nat.DefaultPublicNatGateway(this, `DefaultPublicNatGateway${index + 1}`, {
        publicSubnet,
        privateSubnets,
        eip,
      });
    });
  }
}
