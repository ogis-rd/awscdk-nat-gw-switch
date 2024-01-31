import * as core from 'aws-cdk-lib/core';
import { StackSettings } from './context';
import { NatGwSwitchStack } from './nat-gw-switch-stack';

const app = new core.App();
const settings = new StackSettings(app);

new NatGwSwitchStack(app, 'NatGwSwitchStack', {
  env: {
    region: settings.region,
  },
  stackName: settings.stackName ?? 'NatGwSwitchStack',
  natGwConfigurations: settings.natGwConfigurations,
});
