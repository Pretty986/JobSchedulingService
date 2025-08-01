using demo as db from '../db/data-model';

service DemoService {
  entity Employees as projection on db.Employees;
  entity Permissions as projection on db.Permissions;

  // Unbound action for single permission
  action addEmployeeWithPermission(
    employeeFirstName: String,
    employeeLastName: String,
    employeeEmail: String,
    employeeDepartment: String,
    role: String
  ) returns {
    success: Boolean;
    employeeID: UUID;
  };

  // Unbound action for multiple permissions
  action addEmployeeWithMultiplePermissions(
    employeeFirstName: String,
    employeeLastName: String,
    employeeEmail: String,
    employeeDepartment: String,
    roles: array of String
  ) returns {
    success: Boolean;
    employeeID: UUID;
  };
}