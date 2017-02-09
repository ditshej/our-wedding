/********************************************************************************
 *   node js server
 *
 *
 ********************************************************************************/

/** dependency variables */
/* require the express nodejs module */
var express = require('express'),
  /* require the body-parser nodejs module */
  bodyParser = require('body-parser'),
  /* require the path nodejs module */
  path = require('path'),
  /* require the mysql nodejs module */
  mysql = require('mysql'),
  /* define port */
  port = 8081;


/** app server config */
/* set an instance of express */
var app = express();

/* body-parser middleware */
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({extended: true}));


/** define root */
/* tell express the root of our public web folder */
app.use(express.static(path.join('..', 'product')));


/** run server */
//wait for a connection
app.listen(port, function () {
  console.log('Server is running. Point your browser to: http://localhost:' + port);
});


/** MYSQL Database Connection  */
/* create connection to the database */
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: 'sheth_raphinahlich'
});


/** POST REQUEST: form "anmeldung" */
/* tell express what to do when the /anmeldung route is requested */
app.post('/anmeldung', function (req, res) {

  /* set Headers */
  res.setHeader('Content-Type', 'application/json');

  /* send the results back to the user */ //TODO: anstatt dieser Ausgabe sollte hier ein redirect zu einer "Danke für die Anmeldung" Seite gemacht werden.
  res.send(JSON.stringify({
    firstname: req.body.firstname || null,
    lastname: req.body.lastname || null,
    email: req.body.email || null,
    phone: req.body.phone || null,
    address: req.body.address || null,
    plz: req.body.plz || null,
    city: req.body.city || null,
    wedding: req.body.wedding || null,
    party: req.body.party || null,
    comment: req.body.comment || null
  }));

  /* debugging output for the terminal */
  console.log(req.body);


  /* Database Operations */
  /* connect to Database */
  con.connect(function (err) {
    if (err) {
      console.log('Error connecting to Database!');
      return;
    }
    console.log('Database connection established');
  });

  /* set and modify anmeldung-query */
  var anmeldung = req.body;
  //set "wedding" and "party" to true or false
  anmeldung.wedding = anmeldung.wedding == 'on';
  anmeldung.party = anmeldung.party == 'on';
  console.log(anmeldung);

  /* CREATE QUERY */
  query = con.query('INSERT INTO anmeldung SET ?', anmeldung, function (err, res) {
    if (err) throw err;
  });
  console.log(query.sql);

  /* end Database connection */
  con.end(function (err) {
    // The connection is terminated gracefully
    // Ensures all previously enqueued queries are still
    // before sending a COM_QUIT packet to the MySQL server.
  });

});