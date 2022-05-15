import jstar from '../../jstar.js';
$(() => {
	const databases = [{
		name: 'ZINC',
		cmpdLink: 'https://zinc15.docking.org/substances/{0}/',
	}, {
		name: 'SCUBIDOO',
		cmpdLink: 'https://scubidoo.pharmazie.uni-marburg.de/controller/search_product_temp.php?id={0}',
	}, {
		name: 'GDBMedChem',
		cmpdLink: 'http://gdb.unibe.ch/downloads/',
	}, {
		name: 'ChEMBL',
		cmpdLink: 'https://www.ebi.ac.uk/chembl/compound_report_card/{0}/',
	}, {
		name: 'ChemDiv',
		cmpdLink: 'https://chemistryondemand.com:8443/eShop/search_results.jsp?idnumber={0}',
	}, {
		name: 'Specs',
		cmpdLink: 'https://www.specs.net/index.php?page=search_show_structure&structureId={0}&guest=Y',
	}, {
		name: 'SuperNatural',
		cmpdLink: 'http://bioinf-applied.charite.de/supernatural_new/index.php?site=compound_search',
	}, {
		name: 'SureChEMBL',
		cmpdLink: 'https://www.surechembl.org/search/',
	}, {
		name: 'COCONUT',
		cmpdLink: 'https://coconut.naturalproducts.net/',
	}, {
		name: 'Pfizer',
		cmpdLink: 'https://www.pfizer.com/',
	}, {
		name: 'NPASS',
		cmpdLink: 'http://bidd2.nus.edu.sg/NPASS/compound.php?compoundID={0}',
	}, {
		name: 'MedChemExpress',
		cmpdLink: 'https://www.medchemexpress.com/search.html?q={0}',
	}, {
		name: 'Selleckchem',
		cmpdLink: 'https://www.selleckchem.com/search.html?searchDTO.searchParam={0}',
	}, {
		name: 'DrugBank',
		cmpdLink: 'https://www.drugbank.ca/drugs/{0}',
	}, {
		name: 'GtoPdb',
		cmpdLink: 'https://www.guidetopharmacology.org/GRAC/LigandDisplayForward?ligandId={0}',
	}, {
		name: 'TargetMol',
		cmpdLink: 'https://www.targetmol.com/',
	}, {
		name: 'PADFrag',
		cmpdLink: 'http://chemyang.ccnu.edu.cn/ccb/database/PADFrag/index.php/{1}/more/{0}',
	}, {
		name: 'TTD',
		cmpdLink: 'http://db.idrblab.net/ttd/data/drug/details/{0}',
	}, {
		name: 'HybridMolDB',
		cmpdLink: 'http://www.idruglab.com/HybridMolDB/compoundDetail.php?compoundid={0}',
	}, {
		name: 'SWEETLEAD',
		cmpdLink: 'https://simtk.org/projects/sweetlead',
	}, {
		name: 'SuperDRUG',
		cmpdLink: 'http://cheminfo.charite.de/superdrug2/drug_search.html',
	}, {
		name: 'Biopurify',
		cmpdLink: 'http://www.biopurify.com/', // http://chem960.vicp.cc:9106/search.do?a=s&searchtype=1&psize=10&q=BP0013&searchtmp=simplesearch&t=-1 seems broken
	}, {
		name: 'EK-DRD',
		cmpdLink: 'http://www.idruglab.com/drd/drugDetail.php?drugid={0}',
	}, {
		name: 'WITHDRAWN',
		cmpdLink: 'http://cheminfo.charite.de/withdrawn/drug_search.html',
	}];
	String.prototype.format = function() {
		return this.replace(/\{(\d+)\}/g, (m, i) => { // Lambda function inherits 'this' binding from its enclosing function.
			return arguments[i]; // The arguments variable is from the String.prototype.format, not from the anonymous lambda function.
		});
	}
	const d3 = /(\d+)(\d{3})/;
	Number.prototype.thousandize = function () {
		let s = this.toString();
		while (d3.test(s)) {
			s = s.replace(d3, '$1,$2');
		}
		return s;
	};
	let tickCount = 0;
	const tick = (jobId) => {
		$.get('/lbvs/job', { id: jobId }, (job) => {
			if (!job || !job.submitDate) return; // null will be returned if no job matching the id is found. { error: [] } will be returned if the job id fails the server side validation.
			if (++tickCount === 1) {
				$('#jobInfo1 #filename').parent().click((e) => {
					e.preventDefault();
					saveAs(new Blob([job.qryMolSdf], { type: 'text/plain;charset=utf-8' }), job.filename);
				});
			}
			['submitDate', 'startDate', 'endDate'].forEach((key) => {
				if (!job[key]) return;
				job[key] = new Date(job[key]);
				job[key.replace('Date', 'Time')] = $.format.date(job[key], 'HH:mm:ss.SSS'); // Save the time format to a new key, e.g. submitDate -> submitTime
			});
			if (job.endDate) {
				['numQryMol', 'numLibMol', 'numLibCnf'].forEach((key) => {
					job[key] = parseInt(job[key]);
					job[key + 'Str'] = job[key].thousandize();
				});
				job.runtime = (job.endDate - job.startDate) * 1e-3; // in seconds.
				job.runtimeStr = `${job.runtime.toFixed(3)} s`; // Format runtime to an expressive string.
				job.speed = job.numLibCnf * job.numQryMol / job.runtime; // in conformers per second.
				job.speedStr = `${parseInt(job.speed.toFixed(0)).thousandize()} conformers / s`;
				job.status = 'Completed';
			} else {
				job.status = ['Executing', 'Queued'][+!job.startDate];
				$('#results').hide();
			}
			const jobInfoSpanCb = (index, span) => {
				const s = $(span);
				const t = job[s.attr('id')];
				if (t && s.text() !== t) {
					s.text(t).hide().fadeIn('slow');
				}
			};
			$('#jobInfo1 span').each(jobInfoSpanCb);
			$('#jobInfo2 span').each(jobInfoSpanCb);
			if (!job.endDate) {
				setTimeout(() => { tick(jobId); }, 1000);
				return;
			}
			$('#results').show();
			const { jview, parseSdf } = jstar;
			const refreshMolecule = (molecule, jv) => {
				if (molecule.representations === undefined) {
					molecule.representations = {
						stick: jview.createStickRepresentation(molecule.atoms, 0.3, 0.3),
					};
				}
				jv.mdl.children = [];
				jv.mdl.add(molecule.representations.stick);
				jv.reset(molecule);
				jv.render();
			};
			const jviews = $('canvas[id$="MolCanvas3D"]').map(function (index) { // 'this' binding is used.
				const jv = new jview(this);
				const which = ['qry', 'hit'][index];
				$(`#${which}MolExport`).click(function (e) {
					jv.render();
					[`${which}MolCanvas2D`, `${which}MolCanvas3D`].forEach((canvasId) => {
						document.getElementById(canvasId).toBlob((blob) => {
							saveAs(blob, `${canvasId}.png`);
						});
					});
				});
				return jv;
			});
			const smilesDrawer = new SmilesDrawer.Drawer({
				width: 540,
				height: 540,
			});
			const drawSmiles = (mol, canvas) => {
				if (!mol['canonicalSmilesTree']) {
					SmilesDrawer.parse(mol['canonicalSMILES'], (smilesTree) => { // SmilesDrawer.parse() is a static function.
						mol['canonicalSmilesTree'] = smilesTree;
					}, (err) => {
						console.error(err); // Alternatively, use noty() to notify the user.
					});
				}
				smilesDrawer.draw(mol['canonicalSmilesTree'], canvas, 'dark');
			};
			const numHits = 100;
			const cpdb = databases.find((cpdb) => {
				return cpdb.name === job.database;
			});
			const qryMolecules = parseSdf(job.qryMolSdf);
			const hitMolecules = parseSdf(job.hitMolSdf);
			[qryMolecules, hitMolecules].forEach((molecules) => {
				molecules.forEach((mol) => {
					['numAtoms', 'numHBD', 'numHBA', 'numRotatableBonds', 'numRings'].forEach((prop) => {
						mol[prop] = parseInt(mol[prop]);
					});
					['usrScore', 'usrcatScore', 'tanimotoScore', 'exactMW', 'tPSA', 'clogP'].forEach((prop) => {
						mol[prop] = parseFloat(mol[prop]);
					});
				});
			});
			console.assert(qryMolecules.length >= job.numQryMol); // qryMolecules.length is the number of query molecules submitted by the user. job.numQryMol is the number of query molecules processed by the daemon.
			console.assert(hitMolecules.length === job.numQryMol * numHits);
			$('#qryMolIdsLabel').text(`${job.numQryMol} query molecule${['', 's'][+(job.numQryMol > 1)]} processed, out of ${qryMolecules.length} submitted by the user`);
			$('#hitMolIdsLabel').text(`${numHits} hit molecules sorted by ${job.score} score`);
			const hitMolIds = $('#hitMolIds');
			const qryMolIds = $('#qryMolIds');
			hitMolIds.html([...Array(numHits).keys()].map((index) => { // hitMolecules.slice(numHits * qryMolIdx, numHits * (1 + qryMolIdx)).map((hitMol, index) => {});
				return `<button type="button" class="btn">${index}</button>`;
			}).join(''));
			qryMolIds.html([...Array(job.numQryMol).keys()].map((index) => {
				return `<button type="button" class="btn">${index}</button>`;
			}).join(''));
			let qryMolIdx = 0, hitMolIdx = 0;
			const refreshSpan = (span, mol) => {
				const prop = span.attr('id').split('_')[1]; // Ignore the qryMol_ or hitMol_ prefix. The prefix is only used to avoid duplicate id in html.
				const idx = ['usrScore', 'usrcatScore', 'tanimotoScore', 'exactMW', 'tPSA', 'clogP'].indexOf(prop);
				if (idx === -1) {
					span.text(mol[prop]);
				} else {
					span.text(mol[prop].toFixed([6, 6, 6, 3, 2, 4][idx])); // Display scores with 6 digits. Display tPSA with 2 digits. Display exactMW with 3 digits. Display clogP with 4 digits.
				}
			};
			const refreshHitMol = (hitMolIdxClicked) => {
				$(`:nth-child(${1 + hitMolIdx})`, hitMolIds).removeClass('btn-primary'); // The value to the :nth- selectors is 1-indexed.
				hitMolIdx = hitMolIdxClicked;
				$(`:nth-child(${1 + hitMolIdx})`, hitMolIds).addClass('btn-primary'); // The value to the :nth- selectors is 1-indexed.
				const hitMol = hitMolecules[numHits * qryMolIdx + hitMolIdx];
				drawSmiles(hitMol, 'hitMolCanvas2D');
				refreshMolecule(hitMol, jviews[1]);
				$('#hitMolScores span').each((index, span) => {
					refreshSpan($(span), hitMol);
				});
				$('#hitMolProperties span').each((index, span) => {
					refreshSpan($(span), hitMol);
				});
				$('#hitMolProperties #hitMol_id').parent().attr('href', cpdb.cmpdLink.format(hitMol.id, cpdb.name === 'PADFrag' ? ['drug', 'fragment'][+(hitMol.id.charAt(3) === 'F')] : undefined));
			};
			const refreshQryMol = (qryMolIdxClicked) => {
				$(`:nth-child(${1 + qryMolIdx})`, qryMolIds).removeClass('btn-primary'); // The value to the :nth- selectors is 1-indexed.
				qryMolIdx = qryMolIdxClicked;
				$(`:nth-child(${1 + qryMolIdx})`, qryMolIds).addClass('btn-primary'); // The value to the :nth- selectors is 1-indexed.
				const qryMol = qryMolecules[qryMolIdx];
				drawSmiles(qryMol, 'qryMolCanvas2D');
				refreshMolecule(qryMol, jviews[0]);
				$('#qryMolProperties span').each((index, span) => {
					refreshSpan($(span), qryMol);
				});
				refreshHitMol(0); // When the selected query molecule is changed, reset the selected hit molecule to the first.
			};
			refreshQryMol(0);
			$('> button', hitMolIds).click((e) => {
				const hitMolIdxClicked = parseInt($(e.target).text());
				if (hitMolIdxClicked == hitMolIdx) return;
				refreshHitMol(hitMolIdxClicked);
			});
			$('> button', qryMolIds).click((e) => {
				const qryMolIdxClicked = parseInt($(e.target).text());
				if (qryMolIdxClicked == qryMolIdx) return;
				refreshQryMol(qryMolIdxClicked);
			});
			$('#downloads a').each((index, a) => {
				$(a).click((e) => {
					e.preventDefault();
					const text = e.target.text;
					saveAs(new Blob([text === 'hits.sdf' ? job.hitMolSdf : text === 'hits.csv' ? (() => { // Reconstruct hitMolCsv from hitMolSdf
						const props = ['query', 'database', 'id', 'usrScore', 'usrcatScore', 'tanimotoScore', 'canonicalSMILES', 'molFormula', 'numAtoms', 'numHBD', 'numHBA', 'numRotatableBonds', 'numRings', 'exactMW', 'tPSA', 'clogP'];
						return [
							props.join(','),
							...hitMolecules.map((hitMol) => {
								return props.map((prop) => {
									return hitMol[prop];
								}).join(',');
							}),
						].join('\n');
					})() : null]), text);
				});
			});
		});
	};
	const queryArr = location.search.substr(1).split('&').map((kv) => {
		const [ key, val ] = kv.split('=');
		return { key, val }; // { key: decodeURIComponent(key), val: decodeURIComponent(val) }
	});
	const jobIdKV = queryArr.find((kv) => {
		return kv.key === 'id';
	});
	if (jobIdKV) {
		tick(jobIdKV.val);
	}
	const intro = introJs();
	$('#tutorial').click((e) => {
		e.preventDefault();
		intro.start();
	});
});
