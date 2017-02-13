/********************************************************************************
 *   node js server
 *
 *
 ********************************************************************************/

/**
 * dependency VARIABLES
 */
var auth = require('./auth.js'),
  /* require the express nodejs module */
  express = require('express'),
  /* require the body-parser nodejs module */
  bodyParser = require('body-parser'),
  /* require the path nodejs module */
  path = require('path'),
  /* define port */
  serverport = 8081,
  /* require the mysql nodejs module */
  mysql = require('mysql'),
  nodemailer = require('nodemailer');


/**
 * create SERVER
 */
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


/**
 * MYSQL Requests
 */
/** POST REQUEST: form "anmeldung" */
/* tell express what to do when the /anmeldung route is requested */
app.post('/anmeldung', function (req, res) {
  /* set Headers */
  res.setHeader('Content-Type', 'application/json');

  /* debugging output for the terminal */
  console.log(req.body);


  /* Database Operations */
  /* connect to Database */
  var con = mysql.createConnection(auth.mysqlDB);
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

  /* CREATE INSERT QUERY */
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
  var con = mysql.createConnection(auth.mysqlDB);
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
  geschenke.img = geschenke.title.split(' ').join('-').toLowerCase() + '.jpg';
  console.log(geschenke);

  /* CREATE INSERT QUERY */
  query = con.query('INSERT INTO geschenke SET ?', geschenke, function (err, res) {
    if (err) throw err;
  });
  console.log(query.sql);

  /* end Database connection */
  con.end();

});

/** GET REQUEST: from "getpresent" */
/* tell express what to do when the /getpresent route is requested */
app.get('/getpresent', function (req, res) {
  /* set Headers */
  res.setHeader('Content-Type', 'application/json');


  /* Database Operations */
  /* connect to Database */
  var con = mysql.createConnection(auth.mysqlDB);
  con.connect(function (err) {
    if (err) {
      console.log('Error connecting to Database!');
      return;
    }
    console.log('Database connection established');
  });

  /* CREATE SELECT QUERY */
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


/**
 * MAIL CONFIG
 */
/* create reusable transporter object using the default SMTP transport */
var transporter = nodemailer.createTransport({
  port: 587,
  host: 'vega.uberspace.de',
  auth: auth.nodemailerAuth
});
// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log('Mail-Server is ready to take our messages');
  }
});


/**
 * MAIL Requests
 */
/** POST REQUEST: from "postpresentmail" to send Mail for Geschenke */
app.post('/postpresentmail', function (req, res) {
  /* set Headers */
  res.setHeader('Content-Type', 'application/json');

  /* debugging output for the terminal */
  console.log(req.body);

  /* put given values to variables */
  var id = Number(req.body.id),
    title = req.body.title,
    email = req.body.email,
    cost = Number(req.body.cost),
    rate = Number(req.body.rate);


  /* Database Operations 1: GET information about the Geschenk from id */
  /* connect to Database */
  var con1 = mysql.createConnection(auth.mysqlDB);
  con1.connect(function (err) {
    if (err) {
      console.log('Error connecting to Database!');
      return;
    }
    console.log('Database connection established');
  });

  /* CREATE SELECT QUERY */
  query1 = con1.query('SELECT * FROM geschenke WHERE id = ?', id, function (err, row) {
    if (err) throw err;
    console.log('Data received form Database.');
    console.log(row);

    /* get cost from DB */
    var costDB = row[0].cost,
      /* get email-addresses, which have already gift something to that item */
      soldto = row[0].soldto,
      /* create Object to send back to DB */
      modifiedGeschenk = {
        /* calculate new cost */
        cost: costDB - rate,
        /* set email-address, which has gift that item
         * to not override already set email-addresses, check and add after with comma-seperation */
        soldto: soldto ? soldto + ',' + email : email,
        /* if there is no rate set (someone gift the whole item)
         * or the rate of the gift is higher than the cost
         * => set to true */
        sold: rate == 0 || costDB <= rate
      };
    console.log(modifiedGeschenk);


    /* Database Operations 2: Send back the prepared Object to update the DB */
    /* connect to Database */
    var con2 = mysql.createConnection(auth.mysqlDB);
    con2.connect(function (err) {
      if (err) {
        console.log('Error connecting to Database!');
        return;
      }
      console.log('Database connection established');
    });

    /* CREATE UPDATE QUERY */
    query2 = con2.query('UPDATE geschenke SET ? WHERE id = ?', [modifiedGeschenk, id], function (err, res) {
      if (err) throw err;
    });
    console.log(query2.sql);

    /* end Database connection 2 */
    con2.end();

  });
  console.log(query1.sql);

  /* end Database connection 1 */
  con1.end();


  /*

   TODO: und schlussendlich noch das Mail richtig konfigurieren zu unterst.
   */


  /* setup email data */
  var mailOptions = {
    from: { // sender address
      name: 'Raphael & Nathalie Weiss',
      address: 'raphi@nahli.ch'
    },
    to: email, // list of receivers
    bcc: {
      name: 'Raphael Weiss',
      address: 'raphael.92@bluewin.ch'
    },
    subject: 'Hochzeitsgeschenk: ' + title, // Subject line
    text: 'Hallo du wunderbare Person. Vielen Dank, dass du uns ein Geschenk mit in de Ehe geben möchtest. Du hast das Geschenk ' + title + ' ausgewählt. Bitte überweise uns den Betrag von ' + (rate ? rate : cost) + 'CHF au das folgende Konto: Raiffeisenbank Rickenbach-Wilen, IBAN CH21 81402 00000 17475 51, Raphael Weiss, Bildfeldstrasse 2, 9552 Bronschhofen - Hast du das Geschenk nur aus versehen angewählt oder gar nie etwas derartiges gemacht, dann bitten wir dich, kurz auf dieses Mail zu antworten. Vielen Dank und hoffentlich bis bald. Nathalie & Raphael', // plain text body
    html: '<h1>Hallo du wunderbare Person.</h1> <br> Vielen Dank, dass du uns ein Geschenk mit in de Ehe geben möchtest. <br> Du hast das <b>Geschenk ' + title + '</b> ausgewählt. <br> Bitte überweise uns den Betrag von <b>' + (rate ? rate : cost) + 'CHF</b> au das folgende Konto: <br><br>Raiffeisenbank Rickenbach-Wilen <br>IBAN CH21 81402 00000 17475 51 <br>Raphael Weiss <br>Bildfeldstrasse 2 <br>9552 Bronschhofen <br><br>Hast du das Geschenk nur aus versehen angewählt oder gar nie etwas derartiges gemacht, dann bitten wir dich, kurz auf dieses Mail zu antworten. <br>Vielen Dank und hoffentlich bis bald. <br>Nathalie & Raphael' // html body
  };

  //TODO: weiterleitung von raphi@nahli.ch zu mir

  /* send mail with defined transport object */
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      return console.log(err);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });

  res.send('geschenke.html');

});


