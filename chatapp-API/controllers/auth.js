const Joi = require("joi");
const HttpSyatus = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModels");
const helpers = require("../Helpers/helpers");
const dbconfig = require("../config/secret");

module.exports = {
  async CreateUser(req, res) {
    const schema = Joi.object().keys({
      username: Joi.string()
        .min(4)
        .max(10)
        .required(),
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .min(5)
        .required()
    });

    const { error, value } = Joi.validate(req.body, schema);
    console.log(value);
    if (error && error.details) {
      return res
        .status(HttpSyatus.BAD_REQUEST)
        .json({ message: error.details });
    }

    const userEmail = await User.findOne({
      email: helpers.lowerCase(req.body.email)
    });
    if (userEmail) {
      return res
        .status(HttpSyatus.CONFLICT)
        .json({ message: "Email already exist" });
    }

    const username = await User.findOne({
      username: helpers.firstUpper(req.body.username)
    });
    if (username) {
      return res
        .status(HttpSyatus.CONFLICT)
        .json({ message: "Username already exist" });
    }

    return bcrypt.hash(value.password, 10, (err, hash) => {
      if (err) {
        return res
          .status(HttpSyatus.BAD_REQUEST)
          .json({ message: "Error Hashing Password" });
      }

      const body = {
        username: helpers.firstUpper(value.username),
        email: helpers.lowerCase(value.email),
        password: hash
      };
      User.create(body)
        .then(user => {
          const token = jwt.sign({ data: user }, dbconfig.secret, {
            expiresIn: "1h"
          });
          res.cookie("auth", token);
          res
            .status(HttpSyatus.CREATED)
            .json({ message: "User created successfuly", user, token });
        })
        .catch(err => {
          res.status(HttpSyatus.INTERNAL_SERVER_ERROR).json({ message: err });
        });
    });
  },

  async LoginUser(req, res) {
    if (!req.body.username || !req.body.password) {
      return res
        .status(HttpSyatus.INTERNAL_SERVER_ERROR)
        .json({ message: "No empty fields allowed" });
    }

    await User.findOne({ username: helpers.firstUpper(req.body.username) })
      .then(user => {
        if (!user) {
          return res
            .status(HttpSyatus.NOT_FOUND)
            .json({ message: "Username Not Found" });
        }

        return bcrypt.compare(req.body.password, user.password).then(result => {
          if (!result) {
            return res
              .status(HttpSyatus.INTERNAL_SERVER_ERROR)
              .json({ message: "Password is incorrect" });
          }

          const token = jwt.sign({ data: user }, dbconfig.secret, {
            expiresIn: "1h"
          });
          res.cookie("auth", token);
          return res
            .status(HttpSyatus.OK)
            .json({ message: "Login successful,", user, token });
        });
      })
      .catch(err => {
        return res
          .status(HttpSyatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
  }
};
