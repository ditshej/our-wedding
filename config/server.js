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
  /* define port */
  serverport = 8081,
  /* require the mysql nodejs module */
  mysql = require('mysql'),
  /* MYSQL Database Connection Information */
  mysqlDB = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "123456",
    database: 'sheth_raphinahlich'
  };


/** create server */
/* set an instance of express */
var app = express();

/* body-parser middleware */
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({extended: true}));

/* tell express the root of our public web folder */
app.use(express.static(path.join('..', 'product')));

/* run the server */
app.listen(serverport, function () {
  console.log('Server is running. Point your browser to: http://localhost:' + serverport);
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
  var con = mysql.createConnection(mysqlDB);
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
  con.end();

});


/** POST REQUEST: form "addpresent" */
/* tell express what to do when the /addpresent route is requested */
app.post('/addpresent', function (req, res) {
  /* set Headers */
  res.setHeader('Content-Type', 'application/json');

  /* send the results back to the user */ //TODO: anstatt dieser Ausgabe sollte hier ein redirect zu einer "Danke für die Anmeldung" Seite gemacht werden.
  res.send(JSON.stringify({
    title: req.body.title || null,
    description: req.body.description || null,
    costinit: req.body.costinit || null
  }));

  /* debugging output for the terminal */
  console.log(req.body);


  /* Database Operations */
  /* connect to Database */
  var con = mysql.createConnection(mysqlDB);
  con.connect(function (err) {
    if (err) {
      console.log('Error connecting to Database!');
      return;
    }
    console.log('Database connection established');
  });

  /* set and modify anmeldung-query */
  var geschenke = req.body;
  geschenke.cost = geschenke.costinit;
  geschenke.sold = false;
  console.log(geschenke);

  /* CREATE QUERY */
  query = con.query('INSERT INTO geschenke SET ?', geschenke, function (err, res) {
    if (err) throw err;
  });
  console.log(query.sql);

  /* end Database connection */
  con.end();

});

app.get('/getpresent', function (req, res) {
  /* set Headers */
  res.setHeader('Content-Type', 'application/json');


  /* Database Operations */
  /* connect to Database */
  var con = mysql.createConnection(mysqlDB);
  con.connect(function (err) {
    if (err) {
      console.log('Error connecting to Database!');
      return;
    }
    console.log('Database connection established');
  });

  /* CREATE QUERY */
  query = con.query('SELECT * FROM geschenke', function (err, rows) {
    if (err) throw err;
    console.log('Data received form Database.');
    console.log(rows);

    /* send database information to "/getpresent" */
    res.send(rows);
  });
  console.log(query.sql);
  console.log(query);

  /* end Database connection */
  con.end();


});