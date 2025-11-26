// Debug script to check current assignments
const { AssignmentService } = require('./data/assignments-data.ts');

console.log('All assignments:');
const allAssignments = AssignmentService.getAllAssignments();
console.log(JSON.stringify(allAssignments, null, 2));

console.log('\nAssignments for M303:');
const m303Assignments = AssignmentService.getAssignmentsForRoom('m303');
console.log(JSON.stringify(m303Assignments, null, 2));

console.log('\nTotal assignment count:', allAssignments.length);