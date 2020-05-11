$(() => {
	const databases = [{
		name: 'ZINC',
		cmpdLink: 'https://zinc15.docking.org/substances/{0}/',
	}, {
		name: 'SCUBIDOO',
		cmpdLink: 'http://www.kolblab.org/scubidoo/controller/search_reactant.php?r1_id={0}',
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
		cmpdLink: 'https://zenodo.org/record/3747531',
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
	const tick = (jobIdVal) => {
		$.get('/lbvs/job', { id: jobIdVal }, (job) => {
			console.log(job);
			['numQueries', 'numConformers'].forEach((key) => {
				job[key] = parseInt(job[key]);
			});
			['submit', 'start', 'end'].forEach((key) => {
				if (!job[key + 'Date']) return;
				job[key + 'Date'] = new Date(job[key + 'Date']);
				job[key + 'Time'] = $.format.date(job[key + 'Date'], 'HH:mm:ss.SSS');
			});
			if (job.endDate) {
				job.runtime = (job.endDate - job.startDate) * 1e-3; // in seconds.
				job.speed = job.numConformers * job.numQueries * 1e-3 / job.runtime; // in K conformers per second.
				job.runtime = `${job.runtime.toFixed(3)} s`; // Format runtime to an expressive string.
				job.status = ['<span class="text-danger">Failed</span>', '<span class="text-success">Completed</span>'][+!job.error];
			} else {
				job.status = ['<span class="text-info">Executing</span>', '<span class="text-warning">Queued</span>'][+!job.startDate];
				$('#results').hide();
			}
			$('#status span').each(function (d) { // 'this' binding is used.
				const t = $(this);
				const c = job[t.attr('id')];
				if (t.html() !== c) {
					t.html(c).hide().fadeIn('slow');
				}
			});
			if (!job.endDate) {
				setTimeout(() => { tick(jobIdVal); }, 1000);
				return;
			}
			if (job.error) return;
			$('#status #filename').parent().click((e) => {
				e.preventDefault();
				saveAs(new Blob([job.qryMolSdf], {type: 'text/plain;charset=utf-8'}), job.filename);
			});
			$('#results').show();
			const gaugeScreeningSpeed = echarts.init(document.getElementById('gaugeScreeningSpeed'));
			gaugeScreeningSpeed.setOption({
				series: [{
					name: 'Screening speed',
					type: 'gauge',
					min: 0,
					max: 60,
					splitNumber: 12,
//					radius: '100%',
					axisLine: {
						lineStyle: {
							color: [[1/6, '#91c7ae'], [5/6, '#63869e'], [1, '#c23531']],
							width: 8,
						},
					},
					axisTick: {
						length: 15,
					},
					splitLine: {
						length: 20,
						lineStyle: {
							color: 'auto',
						},
					},
					title: {
						fontWeight: 'bold',
					},
					detail: {
						formatter: (value) => {
							return value.toFixed(2);
						},
						fontWeight: 'bold',
					},
					data: [{
						value: job.speed,
						name: 'Thousand\nconformers / s',
					}],
				}],
			});
			const atomColors = { // http://jmol.sourceforge.net/jscolors
				 H: new THREE.Color(0xFFFFFF),
				 C: new THREE.Color(0x909090),
				 N: new THREE.Color(0x3050F8),
				 O: new THREE.Color(0xFF0D0D),
				 F: new THREE.Color(0x90E050),
				NA: new THREE.Color(0xAB5CF2),
				MG: new THREE.Color(0x8AFF00),
				 P: new THREE.Color(0xFF8000),
				 S: new THREE.Color(0xFFFF30),
				CL: new THREE.Color(0x1FF01F),
				 K: new THREE.Color(0x8F40D4),
				CA: new THREE.Color(0x3DFF00),
				MN: new THREE.Color(0x9C7AC7),
				FE: new THREE.Color(0xE06633),
				CO: new THREE.Color(0xF090A0),
				NI: new THREE.Color(0x50D050),
				CU: new THREE.Color(0xC88033),
				ZN: new THREE.Color(0x7D80B0),
				AS: new THREE.Color(0xBD80E3),
				SE: new THREE.Color(0xFFA100),
				BR: new THREE.Color(0xA62929),
				SR: new THREE.Color(0x00FF00),
				MO: new THREE.Color(0x54B5B5),
				CD: new THREE.Color(0xFFD98F),
				 I: new THREE.Color(0x940094),
				CS: new THREE.Color(0x57178F),
				HG: new THREE.Color(0xB8B8D0),
				 U: new THREE.Color(0x008FFF),
			};
			const defaultAtomColor = new THREE.Color(0xCCCCCC);
			const defaultBackgroundColor = new THREE.Color(0x000000);
			const sphereGeometry = new THREE.SphereBufferGeometry(1, 64, 64);
			const cylinderGeometry = new THREE.CylinderBufferGeometry(1, 1, 1, 64, 1);
			const createSphere = (atom, radius) => {
				const mesh = new THREE.Mesh(sphereGeometry, new THREE.MeshLambertMaterial({ color: atom.color }));
				mesh.scale.x = mesh.scale.y = mesh.scale.z = radius;
				mesh.position.copy(atom.coord);
				return mesh;
			};
			const createCylinder = (p0, p1, radius, color) => {
				const mesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshLambertMaterial({ color: color }));
				mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
				mesh.lookAt(p0);
				mesh.updateMatrix();
				mesh.matrixAutoUpdate = false;
				mesh.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius, p0.distanceTo(p1))).multiply(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));
				return mesh;
			};
			const createStickRepresentation = (atoms, atomR, bondR) => {
				const obj = new THREE.Object3D();
				for (let i in atoms) {
					const atom0 = atoms[i];
					obj.add(createSphere(atom0, atomR, false, 0.4));
					for (let j in atom0.bonds) {
						const atom1 = atom0.bonds[j];
						if (atom1.serial < atom0.serial) continue;
						if (atom0.color === atom1.color) {
							obj.add(createCylinder(atom0.coord, atom1.coord, bondR, atom0.color));
						} else {
							const mp = atom0.coord.clone().add(atom1.coord).multiplyScalar(0.5);
							obj.add(createCylinder(atom0.coord, mp, bondR, atom0.color));
							obj.add(createCylinder(atom1.coord, mp, bondR, atom1.color));
						}
					}
				}
				return obj;
			};
			const iview = function (canvas) { // 'this' binding is used.
				this.canvas = $(canvas);
				this.canvas.height(this.canvas.width());
				this.canvas.widthInv  = 1 / this.canvas.width();
				this.canvas.heightInv = 1 / this.canvas.height();
				this.renderer = new THREE.WebGLRenderer({
					canvas: this.canvas.get(0),
					context: canvas.getContext('webgl2', { antialias: true }),
					antialias: true,
				});
				this.renderer.setSize(this.canvas.width(), this.canvas.height());
				this.renderer.setClearColor(defaultBackgroundColor);
				this.directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
				this.directionalLight.position.set(0.2, 0.2, -1).normalize();
				this.ambientLight = new THREE.AmbientLight(0x202020);
				this.mdl = new THREE.Object3D();
				this.rot = new THREE.Object3D();
				this.rot.add(this.mdl);
				this.scene = new THREE.Scene();
				this.scene.add(this.directionalLight);
				this.scene.add(this.ambientLight);
				this.scene.add(this.rot);
				this.scene.fog = new THREE.Fog(defaultBackgroundColor, 100, 200);
				this.camera = new THREE.PerspectiveCamera(20, this.canvas.width() / this.canvas.height(), 1, 800);
				this.camera.position.set(0, 0, -150);
				this.camera.lookAt(new THREE.Vector3(0, 0, 0));
				var me = this;
				this.canvas.bind('contextmenu', (e) => {
					e.preventDefault();
				});
				this.canvas.bind('mouseup touchend', (e) => {
					me.dg = false;
				});
				this.canvas.bind('mousedown touchstart', (e) => {
					e.preventDefault();
					var x = e.pageX;
					var y = e.pageY;
					if (e.originalEvent.targetTouches && e.originalEvent.targetTouches[0]) {
						x = e.originalEvent.targetTouches[0].pageX;
						y = e.originalEvent.targetTouches[0].pageY;
					}
					me.dg = true;
					me.wh = e.which;
					me.cx = x;
					me.cy = y;
					me.cq = me.rot.quaternion.clone();
					me.cz = me.rot.position.z;
					me.cp = me.mdl.position.clone();
					me.cn = me.sn;
					me.cf = me.sf;
				});
				this.canvas.bind('mousemove touchmove', (e) => {
					e.preventDefault();
					if (!me.dg) return;
					var x = e.pageX;
					var y = e.pageY;
					if (e.originalEvent.targetTouches && e.originalEvent.targetTouches[0]) {
						x = e.originalEvent.targetTouches[0].pageX;
						y = e.originalEvent.targetTouches[0].pageY;
					}
					var dx = (x - me.cx) * me.canvas.widthInv;
					var dy = (y - me.cy) * me.canvas.heightInv;
					if (!dx && !dy) return;
					if (e.ctrlKey && e.shiftKey) { // Slab
						me.sn = me.cn + dx * 100;
						me.sf = me.cf + dy * 100;
					} else if (e.ctrlKey || me.wh == 3) { // Translate
						var scaleFactor = Math.max((me.rot.position.z - me.camera.position.z) * 0.85, 20);
						me.mdl.position.copy(me.cp).add(new THREE.Vector3(-dx * scaleFactor, -dy * scaleFactor, 0).applyQuaternion(me.rot.quaternion.clone().inverse().normalize()));
					} else if (e.shiftKey || me.wh == 2) { // Zoom
						var scaleFactor = Math.max((me.rot.position.z - me.camera.position.z) * 0.85, 80);
						me.rot.position.z = me.cz - dy * scaleFactor;
					} else { // Rotate
						var r = Math.sqrt(dx * dx + dy * dy);
						var rs = Math.sin(r * Math.PI) / r;
						me.rot.quaternion.set(1, 0, 0, 0).multiply(new THREE.Quaternion(Math.cos(r * Math.PI), 0, rs * dx, rs * dy)).multiply(me.cq);
					}
					me.render();
				});
				this.canvas.bind('mousewheel', (e) => {
					e.preventDefault();
					me.rot.position.z -= e.originalEvent.wheelDelta * 0.025;
					me.render();
				});
				this.canvas.bind('DOMMouseScroll', (e) => {
					e.preventDefault();
					me.rot.position.z += e.originalEvent.detail;
					me.render();
				});
			};
			iview.prototype = {
				constructor: iview,
				reset: function (molecule) { // 'this' binding is used.
					var maxD = molecule.maxD;
					if (maxD === undefined) {
						var cmin = new THREE.Vector3( 10000, 10000, 10000);
						var cmax = new THREE.Vector3(-10000,-10000,-10000);
						var csum = new THREE.Vector3();
						var atoms = molecule.atoms;
						for (var i in atoms) {
							var coord = atoms[i].coord;
							csum.add(coord);
							cmin.min(coord);
							cmax.max(coord);
						}
						molecule.maxD = maxD = cmax.distanceTo(cmin) + 4;
						molecule.ctrV = csum.clone().multiplyScalar(-1 / molecule.nha);
					}
					this.sn = -maxD;
					this.sf =  maxD;
					this.mdl.position.copy(molecule.ctrV);
					this.rot.position.z = maxD * 0.35 / Math.tan(Math.PI / 180.0 * 10) - 140;
				},
				render: function () { // 'this' binding is used.
					var center = this.rot.position.z - this.camera.position.z;
					if (center < 1) center = 1;
					this.camera.near = center + this.sn;
					if (this.camera.near < 1) this.camera.near = 1;
					this.camera.far = center + this.sf;
					if (this.camera.near + 1 > this.camera.far) this.camera.far = this.camera.near + 1;
					this.camera.updateProjectionMatrix();
					this.scene.fog.near = this.camera.near + 0.4 * (this.camera.far - this.camera.near);
					this.scene.fog.far = this.camera.far;
					this.renderer.render(this.scene, this.camera);
				},
				exportCanvas: function () { // 'this' binding is used.
					this.render();
					this.toBlob((blob) => {
						saveAs(blob, `${this.canvas.get(0).id}.png`);
					});
				},
			};
			const parseSDF = (src) => {
				const molecules = [];
				for (let lines = src.split(/\r\n|\n|\r/), l = lines.length - 1, offset = 0; offset < l;) {
					const molecule = {
						atoms: {},
						id: lines[offset],
					}, atoms = molecule.atoms;
					offset += 3;
					const atomCount = parseInt(lines[offset].substr(0, 3));
					const bondCount = parseInt(lines[offset].substr(3, 3));
					for (let i = 1; i <= atomCount; ++i) {
						const line = lines[++offset];
						const atom = {
							serial: i,
							coord: new THREE.Vector3(parseFloat(line.substr(0, 10)), parseFloat(line.substr(10, 10)), parseFloat(line.substr(20, 10))),
							elem: line.substr(31, 2).replace(/ /g, '').toUpperCase(),
							bonds: [],
						};
						if (atom.elem === 'H') continue;
						atom.color = atomColors[atom.elem] || defaultAtomColor;
						atoms[atom.serial] = atom;
					}
					molecule.nha = Object.keys(atoms).length;
					for (let i = 1; i <= bondCount; ++i) {
						const line = lines[++offset];
						const atom0 = atoms[parseInt(line.substr(0, 3))];
						if (atom0 === undefined) continue;
						const atom1 = atoms[parseInt(line.substr(3, 3))];
						if (atom1 === undefined) continue;
						atom0.bonds.push(atom1);
						atom1.bonds.push(atom0);
					}
					for (let line = lines[offset++]; line !== '$$$$'; line = lines[offset++]) {
						if (line[0] === '>') {
							const prop = line.split('<')[1].split('>')[0];
							molecule[prop] = lines[offset++];
							if (prop.startsWith('num')) {
								molecule[prop] = parseInt(molecule[prop]);
							} else if (['exactMW', 'clogP', 'tPSA'].includes(prop)) {
								molecule[prop] = parseFloat(molecule[prop]);
							}
						}
					}
					molecules.push(molecule);
				}
				return molecules;
			};
			const refreshMolecule = (molecule, iv) => {
				if (molecule.representations === undefined) {
					molecule.representations = {
						stick: createStickRepresentation(molecule.atoms, 0.3, 0.3),
					};
				}
				iv.mdl.children = [];
				iv.mdl.add(molecule.representations.stick);
				iv.reset(molecule);
				iv.render();
			};
			const iviews = $('canvas[id$="MolCanvas3D"]').map(function (index) { // 'this' binding is used.
				const iv = new iview(this);
				const which = ['qry', 'hit'][index];
				$(`#${which}MolExport`).click(function (e) {
					iv.render();
					[`${which}MolCanvas2D`, `${which}MolCanvas3D`].forEach((canvasId) => {
						document.getElementById(canvasId).toBlob((blob) => {
							saveAs(blob, `${canvasId}.png`);
						});
					});
//					iv.exportCanvas();
				});
				return iv;
			});
			const smilesDrawer = new SmilesDrawer.Drawer({
				width: 540,
				height: 540,
			});
			const cpdb = databases.find((cpdb) => {
				return cpdb.name === job.database;
			});
			const qryMolecules = parseSDF(job.qryMolSdf).slice(0, 1); // Take out only the first query molecule and discard subsequent query molecules, if any.
			if (qryMolecules.length !== job.numQueries) throw Error('qryMolecules.length !== job.numQueries');
			$('#qryMolIdsLabel').text(`${qryMolecules.length} query molecule${['', 's'][+(qryMolecules.length > 1)]}`);
			var qryMolIdx;
			const refreshQryMol = (qryMolIdxClicked) => {
				const qryMol = qryMolecules[qryMolIdx = qryMolIdxClicked];
				refreshMolecule(qryMol, iviews[0]);
				$('#downloads a').each(function () { // 'this' binding is used.
					const t = $(this);
//					t.attr('href', 'job/' + jobIdVal + '/' + qryMolIdx + '/' + t.text());
					// TODO reconstruct hits.sdf and hits.csv from the returned job object.
				});
				$('#qryMolProperties span').each(function () { // 'this' binding is used.
					const t = $(this);
					const prop = t.attr('id');
					const idx = ['tPSA', 'exactMW', 'clogP'].indexOf(prop);
					if (idx === -1) {
						t.text(qryMol[prop]);
					} else {
						t.text(qryMol[prop].toFixed(2 + idx)); // Display tPSA with 2 digits. Display exactMW with 3 digits. Display clogP with 4 digits.
					}
				});
				if (!qryMol['canonicalSmilesTree']) {
					SmilesDrawer.parse(qryMol['canonicalSMILES'], (qryMolSmilesTree) => { // SmilesDrawer.parse() is a static function.
						qryMol['canonicalSmilesTree'] = qryMolSmilesTree;
					}, (err) => {
						// TODO: noty()
					});
				}
				smilesDrawer.draw(qryMol['canonicalSmilesTree'], 'qryMolCanvas2D', 'dark');
				const hitMolecules = parseSDF(job.hitMolSdf);
				if (hitMolecules.length !== 100) throw Error("hitMolecules.length !== 100");
				const hitMolCsvLines = job.hitMolCsv.split(/\r?\n/).slice(1, 101);
				if (hitMolCsvLines.length !== hitMolecules.length) throw Error('hitMolCsvLines.length !== hitMolecules.length');
				const propNames = [ 'usr_score', 'usrcat_score', 'tanimoto_score', 'canonicalSMILES', 'molFormula', 'numAtoms', 'numHBD', 'numHBA', 'numRotatableBonds', 'numRings', 'exactMW', 'tPSA', 'clogP' ];
				$.each(hitMolecules, (i, molecule) => {
					const properties = hitMolCsvLines[i].split(',');
					if (molecule.id !== properties[0]) throw Error('molecule.id !== properties[0]');
					$.each(propNames, (j, propName) => {
						molecule[propName] = properties[1+j];
					});
				});
				$('#hitMolIdsLabel').text(hitMolecules.length + ' hit molecules sorted by ' + job.score + ' score');
				var hitMolIdx;
				const refreshHitMol = (hitMolIdxClicked) => {
					const hitMol = hitMolecules[hitMolIdx = hitMolIdxClicked];
					refreshMolecule(hitMol, iviews[1]);
					$('#hitMolScores span').each(function () { // 'this' binding is used.
						const t = $(this);
						const prop = t.attr('id');
						t.text(parseFloat(hitMol[prop]).toFixed(6));
					});
					$('#hitMolProperties span').each(function () { // 'this' binding is used.
						const t = $(this);
						const prop = t.attr('id');
						t.text(hitMol[prop]); // TODO parseFloat() before toFixed().
					});
					$('#hitMolProperties #id').parent().attr('href', cpdb.cmpdLink.format(hitMol.id, cpdb.name === 'PADFrag' ? ['drug', 'fragment'][+(hitMol.id.charAt(3) === 'F')] : undefined));
					if (!hitMol['canonicalSmilesTree']) {
						SmilesDrawer.parse(hitMol['canonicalSMILES'], (hitMolSmilesTree) => { // SmilesDrawer.parse() is a static function.
							hitMol['canonicalSmilesTree'] = hitMolSmilesTree;
						}, (err) => {
							// TODO: noty()
						});
					}
					smilesDrawer.draw(hitMol['canonicalSmilesTree'], 'hitMolCanvas2D', 'dark');
				};
				const hitMolIds = $('#hitMolIds');
				hitMolIds.html(hitMolecules.map((hitMol, index) => {
					return `<button type="button" class="btn btn-primary">${index}</button>`;
				}).join(''));
				$('> button', hitMolIds).click((e) => {
					const hitMolIdxClicked = $(e.target).text();
					if (hitMolIdxClicked == hitMolIdx) return;
					$('> button.active', hitMolIds).removeClass('active');
					refreshHitMol(hitMolIdxClicked);
				});
				$(':first', hitMolIds).addClass('active');
				refreshHitMol(0);
			};
			const qryMolIds = $('#qryMolIds');
			qryMolIds.html(qryMolecules.map((qryMol, index) => {
				return `<button type="button" class="btn btn-primary">${index}</button>`;
			}).join(''));
			$('> .btn', qryMolIds).click((e) => {
				const qryMolIdxClicked = $(e.target).text();
				if (qryMolIdxClicked == qryMolIdx) return;
				$('> button.active', qryMolIds).removeClass('active');
				refreshQryMol(qryMolIdxClicked);
			});
			$(':first', qryMolIds).addClass('active');
			refreshQryMol(0);
		});
	};
	const queryArr = location.search.substr(1).split('&').map((kv) => {
		const [ key, val ] = kv.split('=');
		return { key, val };
	});
	const jobId = queryArr.find((kv) => {
		return kv.key === 'id';
	});
	if (jobId) {
		tick(jobId.val);
	}
});
