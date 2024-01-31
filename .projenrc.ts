import { awscdk, javascript } from 'projen';
import { stackSettings } from './.projenrc-cdk-context';
import { StackSettings } from './src/context';

const project = new awscdk.AwsCdkTypeScriptApp({
  name: '@ogis-rd/awscdk-nat-gw-switch',
  description: 'AWS CDK app to turn NAT gateways on and off',

  buildWorkflow: false,
  depsUpgradeOptions: {
    workflow: false,
  },
  githubOptions: {
    pullRequestLint: false,
  },
  pullRequestTemplate: false,

  cdkVersion: '2.73.0',
  deps: [
    '@ogis-rd/awscdk-nat-lib@^0',
  ],

  context: {
    [StackSettings.KEY]: stackSettings,
  },

  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,

  repository: 'https://github.com/ogis-rd/awscdk-nat-gw-switch.git',
  defaultReleaseBranch: 'main',

  authorName: 'OGIS-RI Co.,Ltd.',
  authorUrl: 'https://www.ogis-ri.co.jp',
  authorOrganization: true,
});

project.synth();
