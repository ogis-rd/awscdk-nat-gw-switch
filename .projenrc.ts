import { awscdk, javascript } from 'projen';
import { Job, JobPermission, JobStep } from 'projen/lib/github/workflows-model';
import { stackSettings } from './.projenrc-cdk-context';
import { StackSettings } from './src/context';

const project = new awscdk.AwsCdkTypeScriptApp({
  name: '@ogis-rd/awscdk-nat-gw-switch',
  description: 'AWS CDK app to turn NAT gateways on and off',

  depsUpgradeOptions: {
    workflow: false,
  },
  githubOptions: {
    mergify: false,
    pullRequestLint: false,
  },
  pullRequestTemplate: false,

  cdkVersion: '2.73.0',
  deps: [
    '@ogis-rd/awscdk-nat-lib@^0',
  ],
  projenVersion: '0.87.4',

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

const npmTokenName = 'NPM_TOKEN';

// Use the per-project config file (ignore the error-prone config file created with actions/setup-node)
const npmrc = project.npmrc;
npmrc.addRegistry('https://npm.pkg.github.com', '@ogis-rd');
npmrc.addConfig('//npm.pkg.github.com/:_authToken', `\${${npmTokenName}}`);
// "pre" or "post" scripts are not needed for now
npmrc.addConfig('ignore-scripts', 'true');

if (stackSettings) {
  const switchJobCommonDefinition: Omit<Job, 'steps'> = {
    permissions: {
      // Required for JWT
      idToken: JobPermission.WRITE,
      // Required for actions/checkout
      contents: JobPermission.READ,
    },
    runsOn: ['ubuntu-latest'],
    timeoutMinutes: 10,
  };

  const switchJobPreSteps: JobStep[] = [
    {
      uses: 'actions/checkout@v4',
    },
    {
      uses: 'actions/setup-node@v4',
      with: {
        'node-version': '18',
        'cache': 'npm',
      },
    },
    {
      uses: 'aws-actions/configure-aws-credentials@v4',
      with: {
        'role-to-assume': '${{ secrets.ROLE_TO_ASSUME }}',
        'aws-region': stackSettings.region,
      },
    },
    {
      run: 'npm ci',
      env: {
        [`${npmTokenName}`]: `\${{ secrets.${npmTokenName} }}`,
      },
    },
  ];

  const natOn = project.github!.addWorkflow('nat-on');
  natOn.on({ workflowDispatch: {} });
  natOn.addJob('nat-on', {
    ...switchJobCommonDefinition,
    steps: switchJobPreSteps.concat(
      {
        name: 'NAT ON',
        run: 'npm run nat-on',
      },
    ),
  });

  const natOff = project.github!.addWorkflow('nat-off');
  natOff.on({ workflowDispatch: {} });
  natOff.addJob('nat-off', {
    ...switchJobCommonDefinition,
    steps: switchJobPreSteps.concat(
      {
        name: 'NAT OFF',
        run: 'npm run nat-off',
      },
    ),
  });
}

project.addScripts({
  'nat-on': 'npx projen deploy --require-approval never',
  'nat-off': 'npx projen destroy --force',
});

project.synth();
