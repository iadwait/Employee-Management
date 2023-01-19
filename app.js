// Project - Employee Management System
// Author - Adwait Barkale
// Tech - NodeJS, Express JS, MySQL DB

require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const app = express();
let isSQLConfigurationSuccess = false
const connection = mysql.createConnection({
    host: process.env.DATABASE_HOSTNAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
});
app.use(express.json());

// Make Database Connection
connection.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Database connected Successfully !!');
        createDatabaseAndTables();
    }
});

// Function to create Database and Tables IF NOT Exist
function createDatabaseAndTables() {
    connection.query('create database IF NOT EXISTS EmployeeManagement', (err, result) => {
        if (err) {
            console.log(err);
        } else {
            // Database Created, now create table
            connection.query('CREATE TABLE IF NOT EXISTS `EmployeeManagement`.`EmployeeData` (`Employee ID` INT NOT NULL,`EmployeeName` VARCHAR(60) NOT NULL,PRIMARY KEY (`Employee ID`),UNIQUE INDEX `Employee ID_UNIQUE` (`Employee ID` ASC) VISIBLE)', (err, result) => {
                if (err) {
                    console.log('EmployeeData Table Creation Failure !!');
                } else {
                    // Use Database
                    connection.query('USE EmployeeManagement;', (err, result) => {
                        if (err) {
                            res.send(err);
                        } else {
                            console.log('Database and Tables configured success, ready to use the application !!');
                            isSQLConfigurationSuccess = true;
                        }
                    });
                }
            });
        }
    });
}

// MARK: - Variable Declarations
const EmployeeData = [
    // { srNo: 1, employeeID: 0851, employeeName: "Adwait" },
    // { srNo: 2, employeeID: 1047, employeeName: "Vikrant" },
    // { srNo: 3, employeeID: 0852, employeeName: "Prasad" }
];

// MARK: - API's

// API to check if server is running
app.get('/api/serverHealth', (req, res) => {
    res.send('Employee Server up and running !');
});

// API to get all Employee Details
app.get('/api/employeeDetails', (req, res) => {
    if (isSQLConfigurationSuccess) {
        connection.query('SELECT * FROM EmployeeData', (err, result) => {
            if (err) {
                failureResponse(400, err, res)
            } else {
                res.send(result);
            }
        });
    } else {
        failureResponse(503, 'Facing technical issues with Database, Please try again later.', res)
    }
});

// API to get specific employee details by ID
app.get('/api/employeeDetails/:employeeID', (req, res) => {
    if (isSQLConfigurationSuccess) {
        const query = "SELECT * FROM EmployeeData WHERE `Employee ID` = " + req.params.employeeID
        connection.query(query, (err, result) => {
            if (err) {
                failureResponse(400, err, res)
                //res.send('Employee with given ID dose not exist');
            } else {
                console.log(query)
                res.send(result);
            }
        });
    } else {
        failureResponse(503, 'Facing technical issues with Database, Please try again later.', res)
    }
});

// API to add new employee
app.post('/api/addEmployee', (req, res) => {
    if (isSQLConfigurationSuccess) {
        // Validate request data
        if (!req.body.employeeID || req.body.employeeID.length < 1) {
            failureResponse(400, 'Employee ID should not be empty.', res)
            return;
        } else if (!req.body.employeeName || req.body.employeeName.length < 3) {
            failureResponse(400, 'Please provide employee name with atleast 3 characters long.', res)
            return;
        }
        const query = "SELECT EmployeeName FROM EmployeeData WHERE `Employee ID`= " + req.body.employeeID
        connection.query(query, function (err, row) {
            if (err) {
                failureResponse(400, 'Please check your request and try again.', res)
                return;
            } else {
                if (row.length != 0) {
                    failureResponse(400, 'Employee with the given ID already exist.', res)
                    return;
                } else {
                    // Input Data on Database
                    connection.query("INSERT INTO `EmployeeManagement`.`EmployeeData` (`Employee ID`, `EmployeeName`) VALUES ('" + parseInt(req.body.employeeID) + "', '" + req.body.employeeName + "');", (err, result) => {
                        if (err) {
                            failureResponse(400, 'Failed to insert data into database, Please check your request and try again.', res)
                        } else {
                            res.status(200).send('Employee Data Inserted Successfully !!');
                        }
                    });
                }
            }
        });
    } else {
        failureResponse(503, 'Facing technical issues with Database, Please try again later.', res)
    }
});

// API to update employee data
app.put('/api/updateEmployeeData', (req, res) => {
    if (isSQLConfigurationSuccess) {

        connection.query("UPDATE `EmployeeData` SET EmployeeName = '" + req.body.employeeName + "' WHERE `Employee ID` = " + req.body.employeeID, (err, result) => {
            if (err) {
                failureResponse(400, 'Failed to update data into database, Please check your request and try again.', res)
            } else {
                res.status(200).send('Employee Data Updated Successfully !!');
            }
        });
    } else {
        failureResponse(503, 'Facing technical issues with Database, Please try again later.', res)
    }
});

// API to delete employee data
app.delete('/api/deleteEmployeeData', async (req, res) => {
    if (isSQLConfigurationSuccess) {
        const query = "SELECT EmployeeName FROM EmployeeData WHERE `Employee ID`= " + req.body.employeeID
        connection.query(query, function (err, row) {
            if (err) {
                failureResponse(400, 'Employee with the given ID does not exist', res)
                return;
            } else {
                if (row.length == 0 || row === undefined) {
                    failureResponse(400, 'Employee with the given ID does not exist', res)
                    return;
                }
                // Employee Exist Perform Delete operation
                connection.query("DELETE FROM `EmployeeData` WHERE `Employee ID` = " + req.body.employeeID, (err, result) => {
                    if (err) {
                        failureResponse(400, 'Failed to delete data into database, Please check your request and try again.', res)
                    } else {
                        res.status(200).send('Employee Data Deleted Successfully !!');
                    }
                });
            }
        });
    } else {
        failureResponse(503, 'Facing technical issues with Database, Please try again later.', res)
    }
});

// Reusable Functions
function failureResponse(errorCode, errorMessage, res) {
    const response = {
        error: {
            errorCode: errorCode,
            errorMessage: errorMessage
        }
    }
    res.status(errorCode).send(response);
}

// List to a port
const port = process.env.PORT;
app.listen(port, () => console.log(`Listening on port: ${port}...`));