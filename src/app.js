const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const redis = require("redis");

class App {
  constructor() {
    this.app = express();
    this.config();
  }

  config() {

    // basic
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.text({ type: 'text/plain' }));
    this.app.use(cors());
    this.app.locals.redis = redis.createClient();
  }
}

export default new App().app;
