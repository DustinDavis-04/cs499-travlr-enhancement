"use strict";

const { test, before, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const jwt = require("jsonwebtoken");

// Use the separate test database before the application is loaded.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "travlr-api-test-secret";

const app = require("../app");
const mongoose = require("mongoose");
const Trip = require("../app_api/models/travlr");


// ========================================================
// TEST SETUP
// #region TEST SETUP
// ========================================================

// Create a valid token so protected routes can be tested
// without needing to create a real login for every test.
const authToken = jwt.sign(
    {
        email: "api-test@travlr.local",
        name: "API Test User"
    },
    process.env.JWT_SECRET
);


// Keep one complete trip object in one place so each test
// starts with the same valid data.
const createTestTrip = (overrides = {}) => ({
    code: "TST001",
    name: "API Test Trip",
    length: "5 days / 4 nights",
    start: "2026-09-01",
    resort: "Test Resort",
    perPerson: "999.00",
    image: "test-trip.jpg",
    description: "Trip created by the automated API tests.",
    ...overrides
});


before(async () => {
    // Wait until Mongoose finishes connecting to travlr_test.
    await mongoose.connection.asPromise();
});


beforeEach(async () => {
    // Give every test an empty trip collection so one test
    // cannot change the result of another.
    await Trip.deleteMany({});
});


after(async () => {
    // Remove test records and close MongoDB when the suite is finished.
    await Trip.deleteMany({});
    await mongoose.connection.close();
});

// #endregion


// ========================================================
// UNAUTHORIZED REQUESTS
// #region UNAUTHORIZED REQUESTS
// ========================================================

test("protected trip routes reject requests without a token", async () => {
    const trip = createTestTrip();

    const createResponse = await request(app)
        .post("/api/trips")
        .send(trip);

    assert.equal(
        createResponse.status,
        401
    );


    const updateResponse = await request(app)
        .put("/api/trips/TST001")
        .send(trip);

    assert.equal(
        updateResponse.status,
        401
    );


    const deleteResponse = await request(app)
        .delete("/api/trips/TST001");

    assert.equal(
        deleteResponse.status,
        401
    );
});

// #endregion


// ========================================================
// REQUIRED FIELD VALIDATION
// #region REQUIRED FIELD VALIDATION
// ========================================================

test("trip creation rejects missing required fields", async () => {
    const incompleteTrip = createTestTrip();

    // Remove one required field so the request should fail validation.
    delete incompleteTrip.description;


    const response = await request(app)
        .post("/api/trips")
        .set(
            "Authorization",
            `Bearer ${authToken}`
        )
        .send(incompleteTrip);


    assert.equal(
        response.status,
        400
    );

    assert.equal(
        response.body.message,
        "All trip fields are required"
    );

    assert.ok(
        response.body.missingFields.includes(
            "description"
        )
    );


    // Validation should stop the bad request before anything is saved.
    const savedTrips = await Trip.countDocuments({});

    assert.equal(
        savedTrips,
        0
    );
});

// #endregion


// ========================================================
// DUPLICATE TRIP CODES
// #region DUPLICATE TRIP CODES
// ========================================================

test("trip creation rejects duplicate trip codes", async () => {
    const trip = createTestTrip();


    const firstResponse = await request(app)
        .post("/api/trips")
        .set(
            "Authorization",
            `Bearer ${authToken}`
        )
        .send(trip);


    assert.equal(
        firstResponse.status,
        201
    );


    // Send the same trip code again to verify the API
    // protects the unique identifier.
    const duplicateResponse = await request(app)
        .post("/api/trips")
        .set(
            "Authorization",
            `Bearer ${authToken}`
        )
        .send(trip);


    assert.equal(
        duplicateResponse.status,
        409
    );

    assert.equal(
        duplicateResponse.body.message,
        "A trip with code TST001 already exists"
    );


    // Only the original record should exist.
    const savedTrips = await Trip.countDocuments({
        code: "TST001"
    });

    assert.equal(
        savedTrips,
        1
    );
});

// #endregion


// ========================================================
// SUCCESSFUL CRUD WORKFLOW
// #region SUCCESSFUL CRUD WORKFLOW
// ========================================================

test("trip API completes a successful CRUD workflow", async () => {
    const originalTrip = createTestTrip();


    // CREATE
    const createResponse = await request(app)
        .post("/api/trips")
        .set(
            "Authorization",
            `Bearer ${authToken}`
        )
        .send(originalTrip);


    assert.equal(
        createResponse.status,
        201
    );

    assert.equal(
        createResponse.body.code,
        "TST001"
    );

    assert.equal(
        createResponse.body.name,
        "API Test Trip"
    );


    // READ
    const readResponse = await request(app)
        .get("/api/trips/TST001");


    assert.equal(
        readResponse.status,
        200
    );

    assert.equal(
        readResponse.body.code,
        "TST001"
    );

    assert.equal(
        readResponse.body.name,
        "API Test Trip"
    );


    // UPDATE
    const updatedTrip = createTestTrip({
        name: "Updated API Test Trip",
        perPerson: "1099.00"
    });


    const updateResponse = await request(app)
        .put("/api/trips/TST001")
        .set(
            "Authorization",
            `Bearer ${authToken}`
        )
        .send(updatedTrip);


    assert.equal(
        updateResponse.status,
        200
    );

    assert.equal(
        updateResponse.body.name,
        "Updated API Test Trip"
    );

    assert.equal(
        updateResponse.body.perPerson,
        "1099.00"
    );


    // DELETE
    const deleteResponse = await request(app)
        .delete("/api/trips/TST001")
        .set(
            "Authorization",
            `Bearer ${authToken}`
        );


    assert.equal(
        deleteResponse.status,
        200
    );

    assert.equal(
        deleteResponse.body.message,
        "Trip TST001 deleted successfully"
    );


    // Make sure the deleted resource really is gone.
    const finalResponse = await request(app)
        .get("/api/trips/TST001");


    assert.equal(
        finalResponse.status,
        404
    );
});

// #endregion