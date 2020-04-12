#!/usr/bin/env node
'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const cluster = require('cluster');
(async () => {
	if (cluster.isMaster) {
		const descriptors = ['natm.u16', 'nhbd.u16', 'nhba.u16', 'nrtb.u16', 'nrng.u16', 'xmwt.f32', 'tpsa.f32', 'clgp.f32'].map((descriptor) => {
			const type = descriptor.substr(5);
			return {
				file: descriptor,
				name: descriptor.substr(0, 4),
				type,
				size: parseInt(type.substr(1)) / 8,
				func: ['readUInt16LE', 'readFloatLE'][['u16', 'f32'].indexOf(type)],
			};
		});
		const databases = [{
			name: 'WITHDRAWN',
			numCompounds: 613,
		}, {
			name: 'SuperDRUG2',
			numCompounds: 3864,
		}].map((db) => {
			db.descriptors = descriptors.map((descriptor) => { // Create a deep copy by either Object.assign({}, descriptor) or JSON.parse(JSON.stringify(descriptors)). Cannot use descriptors.slice() or descriptors.concat() or [...descriptors] because of shallow copy.
				return Object.assign({}, descriptor);
			});
			return db;
		});
		console.time('readFile');
		await Promise.all(databases.map((db) => {
			return Promise.all(db.descriptors.map((descriptor, index) => {
				return fs.promises.readFile(`databases/${db.name}/${descriptor.file}`).then((buf) => {
					assert.equal(buf.length, descriptor.size * db.numCompounds);
					descriptor.buf = buf;
				}, console.error);
			}));
		}));
		console.timeEnd('readFile');
		// Fork worker processes with cluster
		const numWorkerProcesses = 4;
		console.log('Forking %d worker processes', numWorkerProcesses);
		function messageHandler (msg) { // Cannot use lambda function => because of 'this' binding. The 'this.send()' statement requires capturing the worker process.
			if (msg.query === '/jdata/count') {
				const { s2m } = msg; // slave to master.
				const db = databases.find((db) => {
					return db.name === s2m.db;
				});
				let numFilteredCompounds = 0;
				for (let rowIdx = 0; rowIdx < db.numCompounds; ++rowIdx) {
					numFilteredCompounds += +db.descriptors.every((descriptor, colIdx) => {
						const descriptorVal = Buffer.prototype[descriptor.func].call(descriptor.buf, descriptor.size * rowIdx);
						const descriptorCon = s2m.descriptors[colIdx];
						return descriptorCon.lb <= descriptorVal && descriptorVal <= descriptorCon.ub;
					});
				}
				this.send({
					uuid: msg.uuid,
					query: msg.query,
					m2s: { // master to slave.
						numFilteredCompounds,
					},
				}, (err) => { // The optional callback is a function that is invoked after the message is sent but before the slave may have received it. The function is called with a single argument: null on success, or an Error object on failure.
					if (err) {
						console.error(err);
					}
				});
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
	// Connect to MongoDB
	const mongodb = require('mongodb');
	const mongoClient = await mongodb.MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true }); // poolSize is 5 by default.
	const jstar = mongoClient.db('jstar');
//	const jdock = jstar.collection('jdock');
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
	// Define helper variables and functions
	const uuid = require('uuid');
//	const validator = require('./public/validator');
//	const child_process = require('child_process');
	// Get the number of compounds satisfying filtering conditions
	app.route('/jdata/count').get((req, res) => {
		// Validate and sanitize user input
/*		let v = new validator(req.query);
		if (v
			.field('xmwt_lb').message('must be a decimal within [55, 567]').float().min(55).max(567).copy()
			.field('xmwt_ub').message('must be a decimal within [55, 567]').float().min(55).max(567).copy()
			.field('clgp_lb').message('must be a decimal within [-6, 12]').float().min(-6).max(12).copy()
			.field('clgp_ub').message('must be a decimal within [-6, 12]').float().min(-6).max(12).copy()
			.field('nhbd_lb').message('must be an integer within [0, 20]').int().min(0).max(20).copy()
			.field('nhbd_ub').message('must be an integer within [0, 20]').int().min(0).max(20).copy()
			.field('nhba_lb').message('must be an integer within [0, 18]').int().min(0).max(18).copy()
			.field('nhba_ub').message('must be an integer within [0, 18]').int().min(0).max(18).copy()
			.field('tpsa_lb').message('must be an integer within [0, 317]').int().min(0).max(317).copy()
			.field('tpsa_ub').message('must be an integer within [0, 317]').int().min(0).max(317).copy()
			.field('nrtb_lb').message('must be an integer within [0, 35]').int().min(0).max(35).copy()
			.field('nrtb_ub').message('must be an integer within [0, 35]').int().min(0).max(35).copy()
			.failed() || v
			.range('xmwt_lb', 'xmwt_ub')
			.range('clgp_lb', 'clgp_ub')
			.range('nhbd_lb', 'nhbd_ub')
			.range('nhba_lb', 'nhba_ub')
			.range('tpsa_lb', 'tpsa_ub')
			.range('nrtb_lb', 'nrtb_ub')
			.failed()) {
			res.json(v.err);
			return;
		}*/
		// Send query to master process
		const s2mMsg = {
			uuid: uuid.v4(), // Version 4 (random) - Created from cryptographically-strong random values. Version 1 (timestamp) - Created from the system clock (plus random values).
			query: '/jdata/count',
			s2m: {
				db: 'WITHDRAWN',
				descriptors: [{ // natm
					lb: 5,
					ub: 55,
				}, { // nhbd
					lb: 4,
					ub: 8,
				}, { // nhba
					lb: 4,
					ub: 8,
				}, { // nrtb
					lb: 11,
					ub: 33,
				}, { // nrng
					lb: 2,
					ub: 8,
				}, { // xmwt
					lb: 100,
					ub: 800,
				}, { // tpsa
					lb: 100,
					ub: 400,
				}, { // clgp
					lb: -9,
					ub: 12,
				}]
			},
		};
		process.send(s2mMsg, async (err) => { // The optional callback is a function that is invoked after the message is sent but before the master may have received it. The function is called with a single argument: null on success, or an Error object on failure.
			if (err) {
				console.error(err);
				res.json();
				return;
			}
			const m2s = await new Promise((resolve, reject) => {
				process.on('message', (m2sMsg) => {
					if (m2sMsg.uuid === s2mMsg.uuid) {
						assert.equal(m2sMsg.query, s2mMsg.query);
						resolve(m2sMsg.m2s);
					}
				});
			});
			m2s.timestamp = Date.now();
			res.json(m2s);
		});
	});
	// Start listening
	const http_port = 22080, spdy_port = 22443;
	app.listen(http_port);
/*	require('spdy').createServer(require('https').Server, {
		key: fs.readFileSync(__dirname + '/key.pem'),
		cert: fs.readFileSync(__dirname + '/cert.pem')
	}, app).listen(spdy_port);*/
	console.log('Worker %d listening on HTTP port %d and SPDY port %d in %s mode', process.pid, http_port, spdy_port, app.settings.env);
})();
