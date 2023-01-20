module.exports = {
    createDatabase: "create database IF NOT EXISTS EmployeeManagement",
    createEmployeeDataTable: "CREATE TABLE IF NOT EXISTS `EmployeeManagement`.`EmployeeData` (`Employee ID` INT NOT NULL,`EmployeeName` VARCHAR(60) NOT NULL,PRIMARY KEY (`Employee ID`),UNIQUE INDEX `Employee ID_UNIQUE` (`Employee ID` ASC) VISIBLE)",
    useEmployeeManagementDB: "USE EmployeeManagement;",
    fetchAllEmployeesData: "SELECT * FROM EmployeeData",
    fetchEmployeeByID: "SELECT * FROM EmployeeData WHERE `Employee ID` = ",
    fetchEmployeeNameByID: "SELECT EmployeeName FROM EmployeeData WHERE `Employee ID`= ",
    deleteEmployeeByID: "DELETE FROM `EmployeeData` WHERE `Employee ID` = "
  }