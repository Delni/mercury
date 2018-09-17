export default {
  name: '201809091142-AlterOperationsMigrateState',
  up: `
    UPDATE OPERATION SET state = 'registered' WHERE state like '%fa-circle-o';
    UPDATE OPERATION SET state = 'checked' WHERE state like '%fa-circle';
    UPDATE OPERATION SET state = 'verified' WHERE state like '%fa-check-circle';
  `,
  down: `
    UPDATE OPERATION SET state = 'fa fa-circle-o' WHERE state = 'registered';
    UPDATE OPERATION SET state = 'fa fa-circle' WHERE state = 'checked';
    UPDATE OPERATION SET state = 'fa fa-check-circle' WHERE state = 'verified';
  `
}
