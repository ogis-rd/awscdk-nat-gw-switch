import * as core from 'aws-cdk-lib/core';
import { NatGwConfiguration } from './nat-gw-switch-stack';

export class StackSettings {
  static readonly KEY = '@ogis-rd/awscdk-nat-gw-switch:stackSettings';

  readonly region: string;
  readonly stackName?: string;
  readonly natGwConfigurations: NatGwConfiguration[];

  constructor(app: core.App) {
    const settings = app.node.tryGetContext(StackSettings.KEY);

    if (!settings) {
      throw new Error(`CDK context "${StackSettings.KEY}" is required.`);
    }

    this.region = settings.region;
    this.stackName = settings.stackName;
    this.natGwConfigurations = settings.natGwConfigurations;
  }
}
