#!/usr/bin/env node
import assert from 'assert/strict';
import fs from 'fs';
import cluster from 'cluster';
import mongodb from 'mongodb';
import express from 'express';
//import compress from 'compression';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import errorHandler from 'errorhandler';
import * as uuid from 'uuid';
import child_process from 'child_process';
import Ajv from 'ajv';
import spdy from 'spdy';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import cpdb from './public/cpdb/cpdb.js';

if (cluster.isPrimary) {
	const descriptors = ['natm.u16', 'nhbd.u16', 'nhba.u16', 'nrtb.u16', 'nrng.u16', 'xmwt.f32', 'tpsa.f32', 'clgp.f32'].map((descriptor) => {
		const type = descriptor.substring(5);
		return {
			file: descriptor,
			name: descriptor.substring(0, 4),
			type,
			size: parseInt(type.substring(1)) / 8,
			func: ['readUInt16LE', 'readFloatLE'][['u16', 'f32'].indexOf(type)],
		};
	});
	const databases = cpdb.slice(-1);
	databases.map((db) => {
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
		if (msg.query === '/cpdb/count') {
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
} else {
	// Connect to MongoDB
	const mongoClient = new mongodb.MongoClient(`mongodb://localhost:27017/?authSource=jstar&maxPoolSize=3`); // https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/ Always URI encode the username and password using the encodeURIComponent method to ensure they are correctly parsed.
	await mongoClient.connect();
	const jstar = mongoClient.db('jstar');
	const lbvs = jstar.collection('lbvs');
//	const sbvs = jstar.collection('sbvs');
	// Configure express server
	const app = express();
//	app.use(compress());
	app.use(bodyParser.urlencoded({ limit: '600kb', extended: false }));
	app.use(errorHandler({ dumpExceptions: true, showStack: true }));
	app.use(express.static(__dirname + '/public'));
	app.use(favicon(__dirname + '/public/favicon.ico'));
	// Define helper variables and functions
	const ajv = new Ajv(); // { coerceTypes: true }
	const validate = {};
	[{
		name: '/lbvs/job/get',
		schema: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					minLength: 24,
					maxLength: 24,
				},
			},
			required: [ 'id' ],
		},
	}, {
		name: '/lbvs/job/post',
		schema: {
			type: 'object',
			properties: {
				filename: {
					type: 'string',
					minLength: 1,
					maxLength: 20,
				},
				qryMolSdf: { // Caution NoSQL injection
					type: 'string',
					minLength: 1,
					maxLength: 500000,
				},
				database: {
					type: 'string',
					enum: ['ZINC', 'SCUBIDOO', 'GDBMedChem', 'ChEMBL', 'ChemDiv', 'Specs', 'SuperNatural', 'SureChEMBL', 'COCONUT', 'Pfizer', 'NPASS', 'MedChemExpress', 'Selleckchem', 'DrugBank', 'GtoPdb', 'TargetMol', 'PADFrag', 'TTD', 'HybridMolDB', 'SWEETLEAD', 'SuperDRUG', 'Biopurify', 'EK-DRD', 'WITHDRAWN'],
				},
				score: {
					type: 'string',
					enum: ['USR', 'USRCAT'],
				},
			},
			required: [ 'filename', 'qryMolSdf', 'database', 'score' ],
		},
	}].forEach((ns) => {
		validate[ns.name] = ajv.compile(ns.schema);
	});
	// Get the number of compounds satisfying filtering conditions
	app.route('/cpdb/count').get((req, res) => {
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
			query: '/cpdb/count',
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
				}],
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
	app.route('/lbvs/job').get(async (req, res) => {
		const reqDoc = {};
		['id'].forEach((key) => {
			reqDoc[key] = req.query[key];
		});
		if (!validate['/lbvs/job/get'](reqDoc)) {
			res.json({
				error: validate['/lbvs/job/get'].errors,
			});
			return;
		}
		const resDoc = await lbvs.findOne({
			_id: new mongodb.ObjectId(reqDoc.id),
		}, {
			projection: {
				'_id': 0,
				'filename': 1,
				'qryMolSdf': 1,
				'database': 1,
				'score': 1,
				'submitDate': 1,
				'startDate': 1,
				'endDate': 1,
				'hitMolSdf': 1,
				'numQryMol': 1,
				'numLibMol': 1,
				'numLibCnf': 1,
			},
		});
		res.json(resDoc);
	}).post((req, res) => {
		const reqDoc = {};
		['filename', 'qryMolSdf', 'database', 'score'].forEach((key) => {
			reqDoc[key] = req.body[key];
		});
		if (!validate['/lbvs/job/post'](reqDoc)) {
			res.json({
				error: validate['/lbvs/job/post'].errors,
			});
			return;
		}
		const validateProc = child_process.spawn(__dirname + '/bin/validate');
		let validateStdout = Buffer.alloc(0);
		validateProc.stdout.on('data', (data) => {
			validateStdout = Buffer.concat([validateStdout, data]);
		});
		validateProc.on('close', (code, signal) => {
			if (code || signal) {
				res.json({
					code,
					signal,
					error: 'File not conform to the required SDF format',
				});
				return;
			}
/*			{
				database: '',
				score: '',
				createDate: '',
				molecules: [{
					qryMol: {
						sdf: '',
					},
					hitMol: [{
						id: '',
						sdf: '',
						SMILES: '',
						natm: '',
						tpsa: '',
					}, {}],
				}, {}];
			}*/
			reqDoc.qryMolSdf = validateStdout.toString();
			reqDoc.submitDate = new Date();
			lbvs.insertOne(reqDoc, (err, cmdRes) => {
				if (err) {
					console.error(err);
					res.json({
						error: err,
					});
					return;
				}
				res.json({
					id: cmdRes.insertedId,
					message: 'LBVS job created',
				});
			});
		});
		validateProc.stdin.write(reqDoc['qryMolSdf']);
		validateProc.stdin.end();
	});
	// Start listening
	const https_port = 22443;
	spdy.createServer({
		key: fs.readFileSync(__dirname + '/key.pem'),
		cert: fs.readFileSync(__dirname + '/cert.pem'),
	}, app).listen(https_port, (err) => {
		if (err) {
			console.error(err);
			return;
		}
		console.log('Worker %d listening on port %d in %s mode', process.pid, https_port, app.settings.env);
	});
}
