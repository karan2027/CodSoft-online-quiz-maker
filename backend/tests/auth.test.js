const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const Verification = require("../models/Verification");

// Increase test timeout to 20 seconds for SMTP network requests
jest.setTimeout(20000);

// Use a unique email and username each run to avoid collisions
const timestamp = Date.now();
const testEmail = `testuser_${timestamp}@example.com`;
const testUsername = `user_${timestamp}`;
const testPassword = "Password@123";
const newPassword = "NewPassword@456";

let token = "";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
});

afterAll(async () => {
  // Cleanup test user and verification records
  await User.deleteOne({ email: testEmail });
  await Verification.deleteOne({ email: testEmail });
  await mongoose.connection.close();
});

describe("Auth Module", () => {
  test("Register - should fail without OTP and username", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      email: testEmail,
      password: testPassword,
    });

    expect(res.statusCode).toBe(400); // Validation fails
    expect(res.body.success).toBe(false);
  });

  test("Register OTP - should send OTP to email", async () => {
    const res = await request(app).post("/api/auth/register-otp").send({
      email: testEmail,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBeDefined();
  });

  test("Register - should create a new user with correct OTP and username", async () => {
    // Retrieve OTP from DB since SMTP is mocked/asynchronous in test
    const record = await Verification.findOne({ email: testEmail });
    expect(record).toBeDefined();
    expect(record.otp).toBeDefined();

    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      username: testUsername,
      email: testEmail,
      password: testPassword,
      otp: record.otp,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.username).toBe(testUsername);
    expect(res.body.user.password).toBeUndefined();
  });

  test("Register - duplicate email should return 409", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      username: `${testUsername}_dup`,
      email: testEmail,
      password: testPassword,
      otp: "123456",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test("Login - valid credentials should return token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();

    token = res.body.token; // save for protected route tests
  });

  test("Login - wrong password should return 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "WrongPassword@123",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("Protected route - /me should return user with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.username).toBe(testUsername);
  });

  test("Protected route - /me should reject missing token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("Protected route - /me should reject invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.here");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("Forgot Password - should generate OTP for existing user", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: testEmail,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Forgot Password - should return 404 for non-existent email", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: "doesnotexist@example.com",
    });

    expect(res.statusCode).toBe(404);
  });

  test("Verify OTP - should succeed with correct OTP (fetched from DB)", async () => {
    const user = await User.findOne({ email: testEmail });
    const otp = user.otp;

    const res = await request(app).post("/api/auth/verify-otp").send({
      email: testEmail,
      otp,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Verify OTP - should fail with wrong OTP", async () => {
    const res = await request(app).post("/api/auth/verify-otp").send({
      email: testEmail,
      otp: "000000",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Reset Password - should succeed with valid OTP", async () => {
    const user = await User.findOne({ email: testEmail });
    const otp = user.otp;

    const res = await request(app).post("/api/auth/reset-password").send({
      email: testEmail,
      otp,
      newPassword,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Login - should work with new password after reset", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: newPassword,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Login - old password should no longer work", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.statusCode).toBe(401);
  });
});