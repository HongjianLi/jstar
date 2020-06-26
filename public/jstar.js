(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.jstar = {}));
}(this, (function (exports) {
	'use strict';
	const VERSION = '1.0.0';
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
	function jview(canvas) {
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
		const me = this;
		this.canvas.bind('contextmenu', (e) => {
			e.preventDefault();
		});
		this.canvas.bind('mouseup touchend', (e) => {
			me.dg = false;
		});
		this.canvas.bind('mousedown touchstart', (e) => {
			e.preventDefault();
			let x = e.pageX;
			let y = e.pageY;
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
			let x = e.pageX;
			let y = e.pageY;
			if (e.originalEvent.targetTouches && e.originalEvent.targetTouches[0]) {
				x = e.originalEvent.targetTouches[0].pageX;
				y = e.originalEvent.targetTouches[0].pageY;
			}
			let dx = (x - me.cx) * me.canvas.widthInv;
			let dy = (y - me.cy) * me.canvas.heightInv;
			if (!dx && !dy) return;
			if (e.ctrlKey && e.shiftKey) { // Slab
				me.sn = me.cn + dx * 100;
				me.sf = me.cf + dy * 100;
			} else if (e.ctrlKey || me.wh == 3) { // Translate
				const scaleFactor = Math.max((me.rot.position.z - me.camera.position.z) * 0.85, 20);
				me.mdl.position.copy(me.cp).add(new THREE.Vector3(-dx * scaleFactor, -dy * scaleFactor, 0).applyQuaternion(me.rot.quaternion.clone().inverse().normalize()));
			} else if (e.shiftKey || me.wh == 2) { // Zoom
				const scaleFactor = Math.max((me.rot.position.z - me.camera.position.z) * 0.85, 80);
				me.rot.position.z = me.cz - dy * scaleFactor;
			} else { // Rotate
				const r = Math.sqrt(dx * dx + dy * dy);
				const rs = Math.sin(r * Math.PI) / r;
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
	Object.assign(jview, {
/*		colorMolecules: (molecules) => {
			molecules.forEach((molecule) => {
				const { atoms } = molecules;
				for (let i in atoms) {
					const atom = atoms[i];
					atom.color = atomColors[atom.elem] || defaultAtomColor;
				}
			});
		},*/
		createSphere: (atom, radius) => {
			const mesh = new THREE.Mesh(sphereGeometry, new THREE.MeshLambertMaterial({ color: atom.color }));
			mesh.scale.x = mesh.scale.y = mesh.scale.z = radius;
			mesh.position.copy(atom.coord);
			return mesh;
		},
		createCylinder: (p0, p1, radius, color) => {
			const mesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshLambertMaterial({ color: color }));
			mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
			mesh.lookAt(p0);
			mesh.updateMatrix();
			mesh.matrixAutoUpdate = false;
			mesh.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius, p0.distanceTo(p1))).multiply(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));
			return mesh;
		},
		createStickRepresentation: function(atoms, atomR, bondR) {
			const obj = new THREE.Object3D();
			for (let i in atoms) {
				const atom0 = atoms[i];
				obj.add(this.createSphere(atom0, atomR, false, 0.4));
				for (let j in atom0.bonds) {
					const atom1 = atom0.bonds[j];
					if (atom1.serial < atom0.serial) continue;
					if (atom0.color === atom1.color) {
						obj.add(this.createCylinder(atom0.coord, atom1.coord, bondR, atom0.color));
					} else {
						const mp = atom0.coord.clone().add(atom1.coord).multiplyScalar(0.5);
						obj.add(this.createCylinder(atom0.coord, mp, bondR, atom0.color));
						obj.add(this.createCylinder(atom1.coord, mp, bondR, atom1.color));
					}
				}
			}
			return obj;
		},
	});
	Object.assign(jview.prototype, {
		reset: function (molecule) {
			let { maxD } = molecule;
			if (maxD === undefined) {
				const cmin = new THREE.Vector3( 9999,  9999,  9999);
				const cmax = new THREE.Vector3(-9999, -9999, -9999);
				const csum = new THREE.Vector3();
				const { atoms } = molecule;
				for (let i in atoms) {
					const { coord } = atoms[i];
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
		render: function () {
			let center = this.rot.position.z - this.camera.position.z;
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
	});
	const parseSdf = (src) => {
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
				}
			}
			molecules.push(molecule);
		}
		return molecules;
	};
	Object.assign(exports, {
		jview,
		parseSdf,
	});
	Object.defineProperty(exports, '__esModule', { value: true });
})));
