////////////////////////////////////////////////////////////////////////////////
// Includes
////////////////////////////////////////////////////////////////////////////////
var express = require('express');
var Cookies = require('cookies');
var bodyParser = require('body-parser');
var patch = require('patch');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var app = express();
var db;
var isAdmin = false;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


////////////////////////////////////////////////////////////////////////////////
// Auth
////////////////////////////////////////////////////////////////////////////////
var users = [{
	name: "f4rr3ll",
	pass: "1111"
}];

var cookieOptions = {
	maxAge: 12000,
	patch: '/',
	secure: false,
	signed: true
}

function checkCookies(cookies) {
	var cookieLogin = cookies.get('login', { signed: true } );
	if(cookieLogin) {
		for (var i = 0; i < users.length; i++) {
			var u = users[i];
			if(u.name == cookieLogin) {
				isAdmin = true;
				break;
			}
		}
	}
}


////////////////////////////////////////////////////////////////////////////////
// Routes
////////////////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
	var cookies = new Cookies(req, res, {"keys": ['QWErty']});
	checkCookies(cookies);

	console.log('Logged: '+isAdmin);

	res.send('F4rr3LL Test API')
});

//Login
app.post('/login', (req, res) => {
	var cookies = new Cookies(req, res, {"keys": ['QWErty']});
	var foundUser;
	console.log(req.body.name);
	for (var i = 0; i < users.length; i++) {
		var u = users[i];
		if(u.name == req.body.name && u.pass == req.body.pass) {
			foundUser = u.name;
			break;
		}
	}
	if(foundUser !== undefined) {
		console.log('Logged as: '+ foundUser);

		cookies.set('login', foundUser, cookieOptions);

		res.sendStatus(200);
	} else {
		console.log('Login failed!');
		res.sendStatus(500);
	}

	// db.insert(article, (err, result) => {
	// 	if (err) {
	// 		console.log(err);
	// 		res.sendStatus(500);
	// 	}
		// res.send(article);
	// });
});

// Get All
app.get('/articles', (req, res) => {

	db.find().toArray((err, docs) => {
		if (err) {
			console.log(err);
			res.sendStatus(500);
		}
		res.send(docs);
	});
});

// Get One
app.get('/articles/:id', (req, res) => {
	db.findOne({
		_id: ObjectId(req.params.id)
	}, (err, document) => {
		if (err) {
			console.log(err);
			res.sendStatus(500);
		}
		res.send(document);
	});
});

// Add One
app.post('/articles', (req, res) => {

	var cookies = new Cookies(req, res, {"keys": ['QWErty']});
	checkCookies(cookies);

	if(isAdmin){
		var article = {
			name: req.body.name
		};
		db.insert(article, (err, result) => {
			if (err) {
				console.log(err);
				res.sendStatus(500);
			}
			res.send(article);
		});
	}
	else {
		res.sendStatus(500);
	}

});

// Edit One
app.put('/articles/:id', (req, res) => {
	
	db.updateOne(
		{ _id: ObjectId(req.params.id) },
		{ $set: {name: req.body.name }},
		function(err, result) {
			if (err) {
				console.log(err);
				res.sendStatus(500);
			}
			res.sendStatus(200);
		}
	);
});

// Delete One
app.delete('/articles/:id', (req, res) => {
	db.deleteOne(
		{ _id: ObjectId(req.params.id) },
		function(err, result) {
			if (err) {
				console.log(err);
				res.sendStatus(500);
			}
			res.sendStatus(200);
		}
	);
});



////////////////////////////////////////////////////////////////////////////////
// DB Connection
////////////////////////////////////////////////////////////////////////////////

uri = 'mongodb://f4rr3ll:110512@cluster0-shard-00-00-ienf3.mongodb.net:27017,cluster0-shard-00-01-ienf3.mongodb.net:27017,cluster0-shard-00-02-ienf3.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
MongoClient.connect(uri, (err, client) => {
	if (err) {
		return console.log(err)
	}
	db = client.db("posts").collection("posts");
	app.listen(8080, () => {
		console.log('API Started on 8080 port')

	});
});
