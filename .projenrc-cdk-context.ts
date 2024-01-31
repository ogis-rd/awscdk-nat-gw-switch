import { StackSettings } from "./src/context";

// Modify the settings and synthesize the project (`npm run projen`).
// The project's `cdk.json` file and workflow files will be updated.
export const stackSettings: StackSettings = {
  region: 'XX-XXXX-X',
  natGwConfigurations: [
    {
      publicSubnetId: 'subnet-XXXX',
      privateSubnetRouteTableIds: [
        'rtb-XXXX',
      ],
    },
  ],
}

// If you do not add the settings to the project's `cdk.json` file, set undefined as follows.
// export const stackSettings: StackSettings | undefined = undefined
