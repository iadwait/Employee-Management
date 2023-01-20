// Project - Employee Management System
// Author - Adwait Barkale
// Tech - NodeJS, Express JS, MySQL DB

require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
const connection = require('./DatabaseHelper/dbHelper');
const queries = require('./DatabaseHelper/sqlQueries');
const responseHelper = require('./ResponseHelper/responseHelper');
const constants = require('./Utils/constants');
const statusCode = constants.StatusCodes
let isSQLConfigurationSuccess = false

// Function to create Database and Tables IF NOT Exist
function createDatabaseAndTables() {
    const query = queries.createDatabase
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            // Database Created, now create table
            const query = queries.createEmployeeDataTable
            connection.query(query, (err, result) => {
                if (err) {
                    console.log('EmployeeData Table Creation Failure !!');
                } else {
                    // Use Database
                    const query = queries.useEmployeeManagementDB
                    connection.query(query, (err, result) => {
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

createDatabaseAndTables();

// MARK: - API's

// API to check if server is running
app.get('/api/serverHealth', (req, res) => {
    responseHelper.baseResponse(true, 'Employee Server up and running !', null, null, res)
});

// API to get all Employee Details
app.get('/api/employeeDetails', (req, res) => {
    if (isSQLConfigurationSuccess) {
        const query = queries.fetchAllEmployeesData
        connection.query(query, (err, result) => {
            if (err) {
                responseHelper.baseResponse(false, null, statusCode.badRequest, err, res)
            } else {
                const formattedResponse = {
                    employeeDetails: result,
                    totalEmployees: result.length
                }
                responseHelper.baseResponse(true, formattedResponse, null, null, res)
            }
        });
    } else {
        responseHelper.baseResponse(false, null, statusCode.serviceNotAvailable, 'Facing technical issues with Database, Please try again later.', res)
    }
});

// API to get specific employee details by ID
app.get('/api/employeeDetails/:employeeID', (req, res) => {
    if (isSQLConfigurationSuccess) {
        const query = queries.fetchEmployeeByID + req.params.employeeID
        connection.query(query, (err, result) => {
            if (err) {
                responseHelper.baseResponse(false, null, statusCode.badRequest, err, res)
            } else {
                responseHelper.baseResponse(true, result, null, null, res)
            }
        });
    } else {
        responseHelper.baseResponse(false, null, statusCode.serviceNotAvailable, 'Facing technical issues with Database, Please try again later.', res)
    }
});

// API to add new employee
app.post('/api/addEmployee', (req, res) => {
    if (isSQLConfigurationSuccess) {
        // Validate request data
        if (!req.body.employeeID || req.body.employeeID.length < 1) {
            responseHelper.baseResponse(false, null, statusCode.badRequest, 'Employee ID should not be empty.', res)
            return;
        } else if (!req.body.employeeName || req.body.employeeName.length < 3) {
            responseHelper.baseResponse(false, null, statusCode.badRequest, 'Please provide employee name with atleast 3 characters long.', res)
            return;
        }
        const query = queries.fetchEmployeeNameByID + req.body.employeeID
        connection.query(query, function (err, row) {
            if (err) {
                responseHelper.baseResponse(false, null, statusCode.badRequest, 'Please check your request and try again.', res)
                return;
            } else {
                if (row.length != 0) {
                    responseHelper.baseResponse(false, null, statusCode.badRequest, 'Employee with the given ID already exist.', res)
                    return;
                } else {
                    // Input Data on Database
                    const query = "INSERT INTO `EmployeeManagement`.`EmployeeData` (`Employee ID`, `EmployeeName`) VALUES ('" + parseInt(req.body.employeeID) + "', '" + req.body.employeeName + "');"
                    connection.query(query, (err, result) => {
                        if (err) {
                            responseHelper.baseResponse(false, null, statusCode.badRequest, 'Failed to insert data into database, Please check your request and try again.', res)
                        } else {
                            responseHelper.baseResponse(true, 'Employee Data Inserted Successfully !!', null, null, res)
                        }
                    });
                }
            }
        });
    } else {
        responseHelper.baseResponse(false, null, statusCode.serviceNotAvailable, 'Facing technical issues with Database, Please try again later.', res)
    }
});

// API to update employee data
app.put('/api/updateEmployeeData', (req, res) => {
    if (isSQLConfigurationSuccess) {
        // Validate request data
        if (!req.body.employeeID || req.body.employeeID.length < 1) {
            responseHelper.baseResponse(false, null, statusCode.badRequest, 'Employee ID should not be empty.', res)
            return;
        }
        // Check if Employee with the given ID Exists
        const query = queries.fetchEmployeeNameByID + req.body.employeeID
        connection.query(query, function (err, row) {
            if (err) {
                responseHelper.baseResponse(false, null, statusCode.badRequest, 'Please check your request and try again.', res)
                return;
            } else {
                if (row.length == 0) {
                    responseHelper.baseResponse(false, null, statusCode.notFound, 'Employee with the given ID does not exist.', res)
                } else {
                    const query = "UPDATE `EmployeeData` SET EmployeeName = '" + req.body.employeeName + "' WHERE `Employee ID` = " + req.body.employeeID
                    connection.query(query, (err, result) => {
                        if (err) {
                            responseHelper.baseResponse(false, null, statusCode.badRequest, 'Failed to update data into database, Please check your request and try again.', res)
                        } else {
                            responseHelper.baseResponse(true, 'Employee Data Updated Successfully !!', null, null, res)
                        }
                    });
                }
            }
        });
    } else {
        responseHelper.baseResponse(false, null, statusCode.serviceNotAvailable, 'Facing technical issues with Database, Please try again later.', res)
    }
});

// API to delete employee data
app.delete('/api/deleteEmployeeData', async (req, res) => {
    if (isSQLConfigurationSuccess) {
        const query = queries.fetchEmployeeNameByID + req.body.employeeID
        connection.query(query, function (err, row) {
            if (err) {
                responseHelper.baseResponse(false, null, statusCode.notFound, 'Employee with the given ID does not exist', res)
                return;
            } else {
                if (row.length == 0 || row === undefined) {
                    responseHelper.baseResponse(false, null, statusCode.notFound, 'Employee with the given ID does not exist', res)
                    return;
                }
                // Employee Exist Perform Delete operation
                const query = queries.deleteEmployeeByID + req.body.employeeID
                connection.query(query, (err, result) => {
                    if (err) {
                        responseHelper.baseResponse(false, null, statusCode.badRequest, 'Failed to delete data into database, Please check your request and try again.', res)
                    } else {
                        responseHelper.baseResponse(true, 'Employee Data Deleted Successfully !!', null, null, res)
                    }
                });
            }
        });
    } else {
        responseHelper.baseResponse(false, null, statusCode.serviceNotAvailable, 'Facing technical issues with Database, Please try again later.', res)
    }
});

// List to a port
const port = process.env.PORT;
app.listen(port, () => console.log(`Listening on port: ${port}...`));