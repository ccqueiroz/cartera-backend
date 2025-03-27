import { ApplyPaginationHelper } from './apply-pagination.helpers';
import { CheckIfIsNecessaryCreateNewTokenHelpers } from './check-if-is-necessary-create-new-token.helpers';
import { HandleCanProgressToWritteOperationHelper } from './handle-can-progress-to-writte-operation.helpers';
import { MargeSortHelper } from './merge-sort.helpers';

const checkIfIsNecessaryCreateNewTokenHelpers =
  new CheckIfIsNecessaryCreateNewTokenHelpers();

const applayPaginationHelpers = new ApplyPaginationHelper();

const mergeSortHelpers = new MargeSortHelper();

const handleCanProgressToWritteOperation =
  new HandleCanProgressToWritteOperationHelper();

export {
  checkIfIsNecessaryCreateNewTokenHelpers,
  applayPaginationHelpers,
  mergeSortHelpers,
  handleCanProgressToWritteOperation,
};
