/* eslint-disable prefer-destructuring */
/* eslint-disable node/no-unpublished-require */
/* eslint-disable no-undef */
// eslint-disable-next-line node/no-unpublished-require
const request = require("supertest");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("../app");
const connectDB = require("../db/config");

dotenv.config();

// eslint-disable-next-line arrow-body-style
beforeAll(() => {
  return connectDB();
});

afterAll(() => {
  mongoose.connection.close();
});

describe("Tour Endpoints", () => {
  let token;
  beforeAll(() => async () => {
    const res = await request(app).post("/api/v1/users/login").send({
      email: "saiteja13427@gmail.com",
      password: "1234567",
    });
    token = res.body.token;
  });
  test("GET /api/v1/tours", async () => {
    const res = await request(app)
      .get("/api/v1/tours")
      .set({ Authorization: `Bearer ${token}` });
    console.log(res.body);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual("success");
    expect(Array.isArray(res.body.data.tours)).toBeTruthy();
  });
});
