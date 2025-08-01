const cds = require('@sap/cds');

module.exports = cds.service.impl(function () {
  const { Employees, Permissions } = this.entities;

  // 1. Automatic transaction for CREATE
  this.on('CREATE', Employees, async (req) => {
    const exists = await SELECT.one.from(Employees).where({ email: req.data.email });
    if (exists) req.error(400, 'Email already exists!');
    return req.data;
  });

  // 2. Manual transaction: addEmployeeWithPermission
  this.on('addEmployeeWithPermission', async (req) => {
    const tx = cds.tx(req);
    try {
      // Add Employee
      const [employee] = await tx.run(
        INSERT.into(Employees).entries({
          firstName: req.data.employeeFirstName,
          lastName: req.data.employeeLastName,
          email: req.data.employeeEmail,
          department: req.data.employeeDepartment
        })
      );
      // Get employee ID (insert returns empty object in SQLite)
      let employeeID = employee?.ID;
      if (!employeeID) {
        const found = await tx.run(
          SELECT.one.from(Employees).where({ email: req.data.employeeEmail })
        );
        employeeID = found?.ID;
      }
      // Add Permission
      await tx.run(
        INSERT.into(Permissions).entries({ employee_ID: employeeID, role: req.data.role })
      );
      await tx.commit();
      console.log('Manual transaction committed for employee:', employeeID);
      return { success: true, employeeID };
    } catch (e) {
      await tx.rollback();
      console.error('Manual transaction rolled back:', e.message);
      req.error(400, e.message);
    }
  });

  // 3. Manual transaction: addEmployeeWithMultiplePermissions
  this.on('addEmployeeWithMultiplePermissions', async (req) => {
    const tx = cds.tx(req);
    try {
      // Add Employee
      const [employee] = await tx.run(
        INSERT.into(Employees).entries({
          firstName: req.data.employeeFirstName,
          lastName: req.data.employeeLastName,
          email: req.data.employeeEmail,
          department: req.data.employeeDepartment
        })
      );
      // Get employee ID
      let employeeID = employee?.ID;
      if (!employeeID) {
        const found = await tx.run(
          SELECT.one.from(Employees).where({ email: req.data.employeeEmail })
        );
        employeeID = found?.ID;
      }
      // Add multiple Permissions
      for (const role of req.data.roles) {
        console.log(`Creating permission ${role} for employee ${employeeID}`);
        await tx.run(
          INSERT.into(Permissions).entries({ employee_ID: employeeID, role })
        );
      }
      await tx.commit();
      console.log('Nested transaction committed for employee:', employeeID);
      return { success: true, employeeID };
    } catch (e) {
      await tx.rollback();
      console.error('Nested transaction rolled back:', e.message);
      req.error(400, e.message);
    }
  });
});