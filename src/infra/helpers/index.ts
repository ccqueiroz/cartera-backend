import { ApplyPaginationHelper } from './apply-pagination.helpers';
import { CheckIfIsNecessaryCreateNewTokenHelpers } from './check-if-is-necessary-create-new-token.helpers';
import { DeterministicSerializationObjectHelper } from './deterministic-serialization-object.helpers';
import { GenerateHashHelper } from './generate-hash.helpers';
import { HandleCanProgressToWritteOperationHelper } from './handle-can-progress-to-writte-operation.helpers';
import { MargeSortHelper } from './merge-sort.helpers';
import { NormalizeIpHelper } from './normalize-ip.helpers';

const checkIfIsNecessaryCreateNewTokenHelpers =
  new CheckIfIsNecessaryCreateNewTokenHelpers();

const applayPaginationHelpers = new ApplyPaginationHelper();

const mergeSortHelpers = new MargeSortHelper();

const handleCanProgressToWritteOperation =
  new HandleCanProgressToWritteOperationHelper();

const normalizeIp = new NormalizeIpHelper();

const deterministSerializationObjectHelper =
  new DeterministicSerializationObjectHelper();

const generateHashHelper = GenerateHashHelper.create(
  deterministSerializationObjectHelper.execute,
);

export {
  checkIfIsNecessaryCreateNewTokenHelpers,
  applayPaginationHelpers,
  mergeSortHelpers,
  handleCanProgressToWritteOperation,
  normalizeIp,
  generateHashHelper,
};
