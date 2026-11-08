/* Runs both benches through assets/acs-live.js in node and prints the same JSON shape as
   materials/acs_reference.py. Usage: node materials/run-ladder.js > node.json */
var path = require("path");
var S = require(path.join(__dirname, "..", "assets", "acs-sample.js"));
var E = require(path.join(__dirname, "..", "assets", "acs-live.js"));
var sim = {};
E.RUNGS.forEach(function (r) { sim[r[0]] = E.simulate(r[1]); });
process.stdout.write(JSON.stringify({ playground: E.playground(S), simulator: sim }, null, 1) + "\n");
