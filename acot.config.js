module.exports = {
  presets: ["./sample-rule-set"],
  connection: {
    command: "npm start",
  },
  origin: "http://localhost:3000",
  paths: ["/test.html"],
  rules: {
    "sample-rule-set/focus-order": "warn",
  },
};
