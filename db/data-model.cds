namespace demo;
 
entity Employees {

  key ID         : UUID;

      firstName  : String(100);

      lastName   : String(100);

      email      : String(100);

      department : String(100);

}
 
entity Permissions {

  key ID         : UUID;

      employee_ID: UUID;

      role       : String(50);

}
 