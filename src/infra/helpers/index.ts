import { ApplyPaginationHelper } from './apply-pagination.helpers';
import { ApplySortStatusHelper } from './apply-sort-status.helpers';
import { CheckIfIsNecessaryCreateNewTokenHelpers } from './check-if-is-necessary-create-new-token.helpers';
import { DeterministicSerializationObjectHelper } from './deterministic-serialization-object.helpers';
import { GenerateHashHelper } from './generate-hash.helpers';
import { HandleCanProgressToWritteOperationHelper } from './handle-can-progress-to-writte-operation.helpers';
import { MargeSortHelper } from './merge-sort.helpers';
import { NormalizeIpHelper } from './normalize-ip.helpers';

const checkIfIsNecessaryCreateNewTokenHelpers =
  new CheckIfIsNecessaryCreateNewTokenHelpers();

const applyPaginationHelpers = new ApplyPaginationHelper();

const mergeSortHelpers = new MargeSortHelper();

const handleCanProgressToWritteOperation =
  new HandleCanProgressToWritteOperationHelper();

const normalizeIp = new NormalizeIpHelper();

const deterministSerializationObjectHelper =
  new DeterministicSerializationObjectHelper();

const generateHashHelper = GenerateHashHelper.create(
  deterministSerializationObjectHelper.execute,
);

const applySortStatusHelpers = new ApplySortStatusHelper();

export {
  checkIfIsNecessaryCreateNewTokenHelpers,
  applyPaginationHelpers,
  mergeSortHelpers,
  handleCanProgressToWritteOperation,
  normalizeIp,
  generateHashHelper,
  applySortStatusHelpers,
};
