#!/usr/bin/env node
'use strict';
const fs = require('fs');
const fsPromises = fs.promises;
const cluster = require('cluster');
if (cluster.isMaster) {
/*	const prefix = 'databases';
	async function print(path) {
	  const files = await fs.promises.readdir(path);
	  for (const file of files) {
		console.log(file);
	  }
	}
	print('./').catch(console.error);
	const databases = [{
		name: 'WITHDRAWN',
		numCompounds: 613,
	}, {
		name: 'SuperDRUG2',
		numCompounds: 3864,
	}].map((db) => {
		// Parse compound properties
		const prefixDb = `databases/${db.name}`;
		console.log(`Parsing %s`, prefixDb);
		const start = Date.now();
		// .f32: clgp, emwt, tpsa. new Float32Array(arrayBuffer)
		// .u16: natm, nhbd, nhba, nrbd, nrng. new Int16Array(arrayBuffer)
		fs.readFile(`${prefixDb}/prop.f32`, (err, buf) => {
			if (err) throw err;
			// Allocate arrays to hold compound properties
			for (let i = 0, o = 0; i < numCompounds; ++i, o += 26) {
				emwt[i] = buf.readFloatLE(o +  0);
				clgp[i] = buf.readFloatLE(o +  4);
				nhbd[i] = buf.readInt16LE(o + 16);
				nhba[i] = buf.readInt16LE(o + 18);
				tpsa[i] = buf.readInt16LE(o + 20);
				nrbd[i] = buf.readInt16LE(o + 24);
			}
			console.log('Parsed %d compounds within %d milliseconds', numCompounds, Date.now() - start);
		});
		return db;
	});*/
	// Fork worker processes with cluster
	const numWorkerProcesses = 4;
	console.log('Forking %d worker processes', numWorkerProcesses);
	function messageHandler (msg) { // Here cannot use lambda function => because of 'this' binding. The 'this.send()' statement requires capturing the worker process.
		if (msg.query === '/jdata/count') {
/*			let numFilteredCompounds = 0;
			for (var i = 0; i < numCompounds; ++i) {
				numFilteredCompounds += +['emwt', 'clgp', 'nhbd', 'nhba', 'tpsa', 'nrbd'].every((descriptor) => {
					return msg[`${descriptor}_lb`] <= db[descriptor][i] && db[descriptor][i] <= msg[`${descriptor}_ub`];
				});
			}
			this.send({uuid: msg.uuid, compounds: numFilteredCompounds});*/
		}
	};
	for (let i = 0; i < numWorkerProcesses; ++i) {
		cluster.fork().on('message', messageHandler); // Event 'message' occurs when the master receives a message from this specific worker.
	}
	cluster.on('exit', (worker, code, signal) => {
		console.error(`Worker process ${worker.process.pid} died (${signal || code}). Restarting...`);
		cluster.fork().on('message', messageHandler);
	});
	return;
}
/*// Connect to MongoDB
const mongodb = require('mongodb');
mongodb.MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true }).then((mongoClient) => { // poolSize is 5 by default
	const jstar = mongoClient.db('jstar');
//	const jdock = jstar.collection('jdock');*/
	// Configure express server
	const express = require('express');
//	const compress = require('compression');
//	const bodyParser = require('body-parser');
	const favicon = require('serve-favicon');
	const errorHandler = require('errorhandler');
	const app = express();
//	app.use(compress());
//	app.use(bodyParser.urlencoded({ limit: '12mb', extended: false }));
	app.use(errorHandler({ dumpExceptions: true, showStack: true }));
	app.use(express.static(__dirname + '/public'));
	app.use(favicon(__dirname + '/public/favicon.ico'));
/*	// Define helper variables and functions
	const child_process = require('child_process');
	const validator = require('./public/validator');
	const uuid = require('uuid');
	let msg = {};
	const sync = (m_uuid, callback) => {
		if (msg.uuid !== m_uuid) setImmediate(() => {
			sync(m_uuid, callback);
		});
		else callback(msg.compounds);
	};
	process.on('message', (m) => {
		if (m.compounds !== undefined) {
			msg = m;
		}
	});
	// Get the number of compounds satisfying filtering conditions
	app.route('/jdata/count').get((req, res) => {
		// Validate and sanitize user input
		let v = new validator(req.query);
		if (v
			.field('mwt_lb').message('must be a decimal within [55, 567]').float().min(55).max(567).copy()
			.field('mwt_ub').message('must be a decimal within [55, 567]').float().min(55).max(567).copy()
			.field('lgp_lb').message('must be a decimal within [-6, 12]').float().min(-6).max(12).copy()
			.field('lgp_ub').message('must be a decimal within [-6, 12]').float().min(-6).max(12).copy()
			.field('ads_lb').message('must be a decimal within [-57, 29]').float().min(-57).max(29).copy()
			.field('ads_ub').message('must be a decimal within [-57, 29]').float().min(-57).max(29).copy()
			.field('pds_lb').message('must be a decimal within [-543, 1]').float().min(-543).max(1).copy()
			.field('pds_ub').message('must be a decimal within [-543, 1]').float().min(-543).max(1).copy()
			.field('hbd_lb').message('must be an integer within [0, 20]').int().min(0).max(20).copy()
			.field('hbd_ub').message('must be an integer within [0, 20]').int().min(0).max(20).copy()
			.field('hba_lb').message('must be an integer within [0, 18]').int().min(0).max(18).copy()
			.field('hba_ub').message('must be an integer within [0, 18]').int().min(0).max(18).copy()
			.field('psa_lb').message('must be an integer within [0, 317]').int().min(0).max(317).copy()
			.field('psa_ub').message('must be an integer within [0, 317]').int().min(0).max(317).copy()
			.field('chg_lb').message('must be an integer within [-5, 5]').int().min(-5).max(5).copy()
			.field('chg_ub').message('must be an integer within [-5, 5]').int().min(-5).max(5).copy()
			.field('nrb_lb').message('must be an integer within [0, 35]').int().min(0).max(35).copy()
			.field('nrb_ub').message('must be an integer within [0, 35]').int().min(0).max(35).copy()
			.failed() || v
			.range('mwt_lb', 'mwt_ub')
			.range('lgp_lb', 'lgp_ub')
			.range('ads_lb', 'ads_ub')
			.range('pds_lb', 'pds_ub')
			.range('hbd_lb', 'hbd_ub')
			.range('hba_lb', 'hba_ub')
			.range('psa_lb', 'psa_ub')
			.range('chg_lb', 'chg_ub')
			.range('nrb_lb', 'nrb_ub')
			.failed()) {
			res.json(v.err);
			return;
		}
		// Send query to master process
		v.res.query = '/jdata/count';
		v.res.uuid = uuid.v1();
		process.send(v.res);
		sync(v.res.uuid, (compounds) => {
			res.json(compounds);
		});
	});*/
	// Start listening
	const http_port = 22080, spdy_port = 22443;
	app.listen(http_port);
/*	require('spdy').createServer(require('https').Server, {
		key: fs.readFileSync(__dirname + '/key.pem'),
		cert: fs.readFileSync(__dirname + '/cert.pem')
	}, app).listen(spdy_port);*/
	console.log('Worker %d listening on HTTP port %d and SPDY port %d in %s mode', process.pid, http_port, spdy_port, app.settings.env);
//});
