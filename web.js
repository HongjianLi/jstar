#!/usr/bin/env node
import assert from 'assert/strict';
import os from 'os';
import path from 'path';
import fs from 'fs';
import cluster from 'cluster';
import { program } from 'commander';
import mongodb from 'mongodb';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyFormbody from '@fastify/formbody';
//import fastifyFavicon from 'fastify-favicon';
import * as uuid from 'uuid';
import child_process from 'child_process';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import cpdbArr from './public/cpdb/cpdb.js';

// Process program options.
const options = program
	.name('jstar')
	.description('jstar, a modern website for hosting drug discovery services.')
	.version('1.0.0')
	.option('--databases <string>', 'Path to the compound database directory', '../jstar/databases')
	.option('--host <string>', 'DBMS host', 'localhost')
	.option('--port <number>', 'DBMS port', cur => parseInt(cur), 27017)
	.option('--user <string>', 'DBMS user', 'jstard')
	.option('--pass <string>', 'DBMS password')
	.option('--processes <number>', 'number of worker processes to use', cur => parseInt(cur), os.cpus().length)
	.parse()
	.opts();

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
	const databases = cpdbArr.filter(cpdb => ['WITHDRAWN', 'Biopurify', 'SuperDRUG', 'Selleckchem'].includes(cpdb.name)); // This filter is for debug purpose.
	databases.map((db) => {
		db.descriptors = descriptors.map((descriptor) => { // Create a deep copy by either Object.assign({}, descriptor) or JSON.parse(JSON.stringify(descriptors)). Cannot use descriptors.slice() or descriptors.concat() or [...descriptors] because of shallow copy.
			return Object.assign({}, descriptor);
		});
		return db;
	});
	console.time('readFile');
	await Promise.all(databases.map((db) => {
		return Promise.all(db.descriptors.map((descriptor, index) => {
			return fs.promises.readFile(`${options.databases}/${db.name}/${descriptor.file}`).then((buf) => {
				assert.equal(buf.length, descriptor.size * db.numCompounds);
				descriptor.buf = buf;
			}, console.error);
		}));
	}));
	console.timeEnd('readFile');
	// Fork worker processes with cluster
	console.log(`Forking ${options.processes} worker processes`);
	function messageHandler (s2mMsg) { // Cannot use lambda function => because of 'this' binding. The 'this.send()' statement requires capturing the worker process.
		if (s2mMsg.query === '/cpdb/count') {
			const { s2m } = s2mMsg; // slave to master.
			const cpdb = databases.find((db) => {
				return db.name === s2m.db;
			});
			let numFilteredCompounds = 0;
			if (cpdb) { // This condition is for debug purpose. In a production environment, all compound databases will be read and thus cpdb is always found.
			for (let rowIdx = 0; rowIdx < cpdb.numCompounds; ++rowIdx) {
				numFilteredCompounds += +cpdb.descriptors.every((descriptor, colIdx) => {
					const descriptorVal = Buffer.prototype[descriptor.func].call(descriptor.buf, descriptor.size * rowIdx);
					const descriptorCon = s2m.descriptors[colIdx];
					return descriptorCon.min <= descriptorVal && descriptorVal <= descriptorCon.max;
				});
			}
			}
			this.send({
				uuid: s2mMsg.uuid,
				query: s2mMsg.query,
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
	for (let i = 0; i < options.processes; ++i) {
		cluster.fork().on('message', messageHandler); // Event 'message' occurs when the master receives a message from this specific worker.
	}
	cluster.on('exit', (worker, code, signal) => {
		console.error(`Worker process ${worker.process.pid} died (${signal || code}). Restarting...`);
		cluster.fork().on('message', messageHandler);
	});
} else {
	// Connect to MongoDB
	const mongoClient = new mongodb.MongoClient(`mongodb://${options.user}:${options.pass}@${options.host}:${options.port}/?authSource=jstar&maxPoolSize=3`); // https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/ Always URI encode the username and password using the encodeURIComponent method to ensure they are correctly parsed.
	await mongoClient.connect();
	const jstar = mongoClient.db('jstar');
	const lbvs = jstar.collection('lbvs');
//	const sbvs = jstar.collection('sbvs');
	const fastify = Fastify({
		logger: true,
		http2: true,
		https: {
			allowHTTP1: true, // fallback support for HTTP1
			cert: fs.readFileSync(__dirname + "/cert.pem"),
			key: fs.readFileSync(__dirname + "/key.pem"),
		},
	});
//	fastify.register(require('fastify-qs')); // https://github.com/VanoDevium/fastify-qs
	fastify.register(fastifyStatic, { root: path.join(__dirname, 'public') }); // https://github.com/fastify/fastify-static
	fastify.register(fastifyFormbody, { bodyLimit: 600000 }); // https://github.com/fastify/fastify-formbody
//	fastify.register(fastifyFavicon); // https://github.com/smartiniOnGitHub/fastify-favicon
//	import fastifyRecaptcha from 'fastify-recaptcha';
//	fastify.register(fastifyRecaptcha, { recaptcha_secret_key: 'your_recaptcha_sercret_key' }); // https://github.com/qwertyforce/fastify-recaptcha
	// Get the number of compounds satisfying filtering conditions
	fastify.post('/cpdb/count', {
		schema: {
			body: { // body, querystring, params, and header
				type: 'object',
				properties: {
					db: { type: 'string', enum: cpdbArr.map(cpdb => cpdb.name) },
					descriptors: { type: 'array', minItems: 1, maxItems: 8, items: {
						type: 'object',
						properties: {
							name: { type: 'string', enum: cpdbArr[0].descriptors.map(d => d.name) },
							min: { type: 'integer' },
							max: { type: 'integer' },
						},
						required: [ 'name', 'min', 'max' ],
					}},
				},
				required: [ 'db', 'descriptors' ],
			},
		},
		response: {
			200: {
				type: 'object',
				properties: {
					numFilteredCompounds: { type: 'number' },
					timestamp: { type: 'date' },
				}
			},
		},
	}, (req, reply) => {
		// Send query to master process
		const s2mMsg = {
			uuid: uuid.v4(), // Version 4 (random) - Created from cryptographically-strong random values. Version 1 (timestamp) - Created from the system clock (plus random values).
			query: '/cpdb/count',
			s2m: req.body,
		};
		process.send(s2mMsg, async (err) => { // The optional callback is a function that is invoked after the message is sent but before the master may have received it. The function is called with a single argument: null on success, or an Error object on failure.
			if (err) {
				console.error(err);
				reply.send();
				return;
			}
			const m2s = await new Promise((resolve, reject) => {
				process.once('message', (m2sMsg) => {
					if (m2sMsg.uuid === s2mMsg.uuid) {
						assert.equal(m2sMsg.query, s2mMsg.query);
						resolve(m2sMsg.m2s);
					}
				});
			});
			m2s.timestamp = Date.now();
			reply.send(m2s);
		});
	});
	fastify.get('/lbvs/job', {
		schema: {
			querystring: { // body, querystring, params, and header
				type: 'object',
				properties: {
					id: { type: 'string', minLength: 24, maxLength: 24 },
				},
				required: [ 'id' ],
			},
		},
		response: {
			200: {
				type: 'object',
				properties: {
					id: { type: 'string' },
					filename: { type: 'string' },
					qryMolSdf: { type: 'string' },
					database: { type: 'string' },
					score: { type: 'string' },
					hitMolSdf: { type: 'string' },
					numQryMol: { type: 'number' },
					numLibMol: { type: 'number' },
					numLibCnf: { type: 'number' },
				}
			},
		},
	}, async (req, reply) => {
		const reqDoc = {};
		['id'].forEach((key) => {
			reqDoc[key] = req.query[key];
		});
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
		return resDoc;
	});
	fastify.post('/lbvs/job', {
		schema: {
			body: { // body, querystring, params, and header
				type: 'object',
				properties: {
					filename: { type: 'string', minLength: 1, maxLength: 20 },
					qryMolSdf: { type: 'string', minLength: 1, maxLength: 500000 }, // Caution NoSQL injection
					database: { type: 'string', enum: cpdbArr.map(cpdb => cpdb.name) },
					score: { type: 'string', enum: ['USR', 'USRCAT'] },
					descriptors: { type: 'array', minItems: 1, maxItems: 8, items: {
						type: 'object',
						properties: {
							name: { type: 'string', enum: cpdbArr[0].descriptors.map(d => d.name) },
							min: { type: 'integer' },
							max: { type: 'integer' },
						},
						required: [ 'name', 'min', 'max' ],
					}},
				},
				required: [ 'filename', 'qryMolSdf', 'database', 'score' ],
			},
			response: {
				200: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						message: { type: 'string' },
						code: { type: 'number' },
						signal: { type: 'string' },
						error: { type: 'string' },
					}
				},
			},
		},
	}, (req, reply) => {
		const reqDoc = {};
		['filename', 'qryMolSdf', 'database', 'score', 'descriptors'].forEach((key) => {
			reqDoc[key] = req.body[key];
		});
		const validateProc = child_process.spawn(__dirname + '/bin/validate');
		let validateStdout = Buffer.alloc(0);
		validateProc.stdout.on('data', (data) => {
			validateStdout = Buffer.concat([validateStdout, data]);
		});
		validateProc.on('close', (code, signal) => {
			if (code || signal) {
				reply.send({
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
					reply.send({
						error: err,
					});
					return;
				}
				reply.send({
					id: cmdRes.insertedId,
					message: 'LBVS job created',
				});
			});
		});
		validateProc.stdin.write(reqDoc['qryMolSdf']);
		validateProc.stdin.end();
	});
	// Start listening
	fastify.listen({ port: 22443, host: '::' }, (err, address) => {
		if (err) {
			fastify.log.error(err);
			return;
		}
		console.log(`Worker ${process.pid} listening on ${address}`);
	});
}
