// Project - Employee Management System
// Author - Adwait Barkale
// Tech - NodeJS, Express JS, MySQL DB

const express = require('express');
const mysql = require('mysql');
const app = express();
let isSQLConfigurationSuccess = false
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
});
app.use(express.json());

// Create Schema
// CREATE SCHEMA `EmployeeManagement` ;



// Make Database Connection
connection.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Database connected Successfully');
        createDatabaseAndTables();
    }
});

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
                    console.log('Database and Tables configured success, ready to use the application !');
                    isSQLConfigurationSuccess = true;
                }
            });
        }
    });
}

// MARK: - Variable Declarations
const EmployeeData = [
    { srNo: 1, employeeID: 0851, employeeName: "Adwait" },
    { srNo: 2, employeeID: 1047, employeeName: "Vikrant" },
    { srNo: 3, employeeID: 0852, employeeName: "Prasad" }
];

// MARK: - API's

// API to check if server is running
app.get('/api/serverHealth', (req, res) => {
    res.send('Employee Server up and running !');
});

// API to get all Employee Details
app.get('/api/employeeDetails', (req, res) => {
    if (isSQLConfigurationSuccess) {
        res.send(EmployeeData);
    } else {
        res.status(503).send('Facing technical issues with Database, Please try again later.');
    }
});

// API to get specific employee details by ID
app.get('/api/employeeDetails/:employeeID', (req, res) => {
    if (isSQLConfigurationSuccess) {
        const employeeData = EmployeeData.find(e => e.employeeID === parseInt(req.params.employeeID))
        if (!employeeData) {
            res.status(404);
            res.send('Employee with given Employee ID not present.');
            return;
        }
        res.status(200).send(employeeData);
    } else {
        res.status(503).send('Facing technical issues with Database, Please try again later.');
    }
});

// API to add new employee
app.post('/api/addEmployee', (req, res) => {
    if (isSQLConfigurationSuccess) {
        // Validate request data
        if (!req.body.employeeID || req.body.employeeID.length < 1) {
            res.status(400);
            res.send('Employee ID should not be empty.');
            return;
        } else if (!req.body.employeeName || req.body.employeeName.length < 3) {
            res.status(400);
            res.send('Please provide employee name with atleast 3 characters long.');
            return;
        }
        // Check if employee with given id already exists
        const empData = EmployeeData.find(e => e.employeeID === parseInt(req.body.employeeID))
        if (empData) {
            // Employee with given ID already exists
            res.status(400).send('The employee with given employeeID already exists.');
            return;
        }
        // Input Data on Database
        const employeeData = {
            srNo: EmployeeData.length + 1,
            employeeID: parseInt(req.body.employeeID),
            employeeName: req.body.employeeName
        }
        EmployeeData.push(employeeData);
        res.send(employeeData);
    } else {
        res.status(503).send('Facing technical issues with Database, Please try again later.');
    }
});

// API to update employee data
app.put('/api/updateEmployeeData', (req, res) => {
    if (isSQLConfigurationSuccess) {
        // Fetch Employee to update
        let empData = EmployeeData.find(e => e.employeeID === parseInt(req.body.employeeID))
        if (!empData) {
            res.status(404).send('Employee with given employeeID does not exist.');;
            return;
        } else if (!req.body.employeeName || req.body.employeeName.length < 3) {
            res.status(404).send('Please provide employee name with atleast 3 characters long.');
            return;
        }
        // Update Data
        empData.employeeName = req.body.employeeName
        res.send(empData);
    } else {
        res.status(503).send('Facing technical issues with Database, Please try again later.');
    }
});

// API to delete employee data
app.delete('/api/deleteEmployeeData', (req, res) => {
    if (isSQLConfigurationSuccess) {
        // Check if Employee with given ID Exists
        let empData = EmployeeData.find(e => e.employeeID === parseInt(req.body.employeeID))
        if (!empData) {
            res.status(404).send('Employee with given employeeID does not exist.');
            return;
        }
        // Perform Delete
        const empIndex = EmployeeData.indexOf(empData);
        EmployeeData.splice(empIndex, 1);
        res.send(EmployeeData);
    } else {
        res.status(503).send('Facing technical issues with Database, Please try again later.');
    }
});

// List to a port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port: ${port}...`));