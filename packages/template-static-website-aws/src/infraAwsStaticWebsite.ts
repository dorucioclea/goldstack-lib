import { fatal } from '@goldstack/utils-log';
import { upload } from '@goldstack/utils-s3-deployment';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';

import {
  AWSStaticWebsitePackage,
  AWSStaticWebsiteDeployment,
} from './types/AWSStaticWebsitePackage';

const getDeployment = (
  config: AWSStaticWebsitePackage,
  args: string[]
): AWSStaticWebsiteDeployment => {
  if (args.length < 1) {
    fatal('Please specify the name of the deployment.');
  }
  const name = args[0];

  const deployment = config.deployments.find(
    (deployment) => deployment.name === name
  );

  if (!deployment) {
    fatal(`Cannot find configuration for deployment '${name}''`);
    throw new Error('Cannot parse configuration.');
  }

  return deployment;
};

export const deploy = async (
  config: AWSStaticWebsitePackage,
  args: string[]
): Promise<void> => {
  const deployment = getDeployment(config, args);

  await upload({
    userName: deployment.awsUser,
    bucket: deployment.configuration.websiteDomain + '-root',
    region: deployment.awsRegion,
    bucketPath: '/',
    localPath: './webDist',
  });
};

export const infraAwsStaticWebsiteCli = async (
  config: AWSStaticWebsitePackage,
  args: string[]
): Promise<void> => {
  if (args.length < 1) {
    fatal(
      'Please provide the operation in the arguments: "init", "plan", "apply", "deploy", "destroy".'
    );
    throw new Error();
  }
  const [operation, ...opArgs] = args;
  if (operation === 'deploy') {
    await deploy(config, opArgs);
    return;
  }

  await terraformAwsCli(args);
};
