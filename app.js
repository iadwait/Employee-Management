// Project - Employee Management System
// Author - Adwait Barkale
// Tech - NodeJS, Express JS, MySQL DB

const express = require('express');
const app = express();
app.use(express.json());

// MARK: - Variable Declarations
const EmployeeData = [
    {srNo: 1, employeeID: 0851, employeeName: "Adwait"},
    {srNo: 2, employeeID: 1047, employeeName: "Vikrant"},
    {srNo: 3, employeeID: 0852, employeeName: "Prasad"}
];

// MARK: - API's

// API to check if server is running
app.get('/api/serverHealth', (req, res) => {
    res.send('Employee Server up and running !');
});

// API to get all Employee Details
app.get('/api/employeeDetails', (req, res) => {
    res.send(EmployeeData);
});

// API to get specific employee details by ID
app.get('/api/employeeDetails/:employeeID', (req, res) => {
    const employeeData = EmployeeData.find(e => e.employeeID === parseInt(req.params.employeeID))
    if (!employeeData) {
        res.status(404);
        res.send('Employee with given Employee ID not present.');
        return;
    }
    res.status(200).send(employeeData);
});

// API to add new employee
app.post('/api/addEmployee', (req, res) => {
    // Validate request data
    if (!req.body.employeeID || req.body.employeeID.length < 1) {
        res.status(400);
        res.send('Employee ID should not be empty.');
        return;
    } else if (!req.body.employeeName || req.body.employeeName.length < 3) {
        res.status(400);
        res.send('Please provide employee name of atleast 3 characters long.');
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
});

// List to a port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port: ${port}...`));