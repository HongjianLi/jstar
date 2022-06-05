#!/usr/bin/env mongosh
// https://docs.mongodb.com/manual/:
conn = new Mongo("localhost:27017");

// After you create the first user, the localhost exception is no longer available. The first user must have privileges to create other users, such as a user with the userAdminAnyDatabase. This ensures that you can create additional users after the Localhost Exception closes.
// https://docs.mongodb.com/manual/reference/method/db.createUser/
db = conn.getDB("admin");
db.createUser({
	user: "jstarAdmin",
	pwd: passwordPrompt(),
	roles: [{ role: "userAdminAnyDatabase", db: "admin" }],
});

// https://docs.mongodb.com/manual/reference/method/db.auth/
db.auth("jstarAdmin", "jstarAdminPwd");

db = db.getSiblingDB("jstar");
db.createUser({
	user: "jstard",
	pwd: passwordPrompt(),
	roles: [{ role: "readWrite", db: "jstar" }],
});

//db.auth("jstard", "jstardPwd");

// https://docs.mongodb.com/manual/reference/method/db.createCollection/
// https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/
db.createCollection("lbvs", {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			required: ["filename", "qryMolSdf", "database", "score", "submitDate"],
			properties: {
				filename: {
					bsonType: "string",
					description: "must be a string and is required",
					minLength: 1,
					maxLength: 20,
				},
				qryMolSdf: {
					bsonType: "string",
					description: "must be a string and is required",
					minLength: 40,
				},
				database: {
					bsonType: "string",
					description: "must be a string and is required",
					enum: ["ZINC", "SCUBIDOO", "GDBMedChem", "ChEMBL", "ChemDiv", "Specs", "SuperNatural", "SureChEMBL", "COCONUT", "Pfizer", "NPASS", "MedChemExpress", "Selleckchem", "DrugBank", "GtoPdb", "TargetMol", "PADFrag", "TTD", "HybridMolDB", "SWEETLEAD", "SuperDRUG", "Biopurify", "EK-DRD", "WITHDRAWN"],
				},
				score: {
					bsonType: "string",
					description: "must be a string and is required",
					enum: ["USR", "USRCAT"],
				},
				submitDate: {
					bsonType: "date",
					description: "must be a date and is required",
				},
				daemon: {
					bsonType: "string",
					description: "must be a string",
					enum: ["cpp", "js"],
				},
				startDate: {
					bsonType: "date",
					description: "must be a date",
				},
				endDate: {
					bsonType: "date",
					description: "must be a date",
				},
				hitMolSdf: {
					bsonType: "string",
					description: "must be a string",
					minLength: 40,
				},
				numQryMol: {
					bsonType: "int",
					description: "must be an integer",
					minimum: 1,
				},
				numLibMol: {
					bsonType: "int",
					description: "must be an integer",
					minimum: 1,
				},
				numLibCnf: {
					bsonType: "int",
					description: "must be an integer",
					minimum: 4,
				},
			},
		},
	},
});

// https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/
db.lbvs.createIndex({
	startDate: 1,
	submitDate: 1,
}, {
	unique: true,
});
