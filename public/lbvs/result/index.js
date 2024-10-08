import jstar from '../../jstar.js';
import databases from '../../cpdb/cpdb.js';
$(() => {
	let tickCount = 0;
	const tick = (jobId) => {
		fetch(`/lbvs/job?id=${jobId}`).then(response => response.json()).then((job) => {
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
