import cpdbArr from '../cpdb/cpdb.js';
document.addEventListener('DOMContentLoaded', () => {
	const databaseSelect = document.getElementById('database');
	[...databaseSelect.querySelectorAll('option')].forEach((option, index) => {
		const cpdb = cpdbArr[index];
		console.assert(cpdb.name === option.value);
		option.text = `${cpdb.name} (# ${cpdb.numCompounds.thousandize()})`;
		option.value = `${cpdb.name}`;
	});
	async function refreshNumFilteredCompounds() {
		const cpdb = cpdbArr.find(cpdb => cpdb.name === databaseSelect.value);
		const response = await fetch('/cpdb/count', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				db: cpdb.name,
				descriptors: cpdb.descriptors.map(d => ({
					name: d.name,
					min: document.getElementById(`${d.name}Min`).innerText, 
					max: document.getElementById(`${d.name}Max`).innerText,
				})),
			}),
		});
		const result = await response.json();
		document.getElementById('numFilteredCompounds').innerText = result.numFilteredCompounds.thousandize();
	}
	function refreshDescriptorMinMax() {
		const cpdb = cpdbArr.find(cpdb => cpdb.name === databaseSelect.value);
		cpdb.descriptors.forEach(descriptor => {
			const { name, min, max } = descriptor;
			document.getElementById(`${name}Min`).innerText = min;
			document.getElementById(`${name}Max`).innerText = max;
			$(`#slider-${name}`).slider({
				min,
				max,
				values: [ min, max ],
			});
		});
		refreshNumFilteredCompounds();
	}
	refreshDescriptorMinMax();
	cpdbArr[0].descriptors.forEach(descriptor => {
		const { name } = descriptor;
		$(`#slider-${name}`).slider({
			range: true,
			slide: (e, ui) => { // Triggered on every mouse move during slide. https://api.jqueryui.com/slider/
				const { values } = ui;
				document.getElementById(`${name}Min`).innerText = values[0];
				document.getElementById(`${name}Max`).innerText = values[1];
			},
			stop: (e, ui) => { // Triggered after the user slides a handle. https://api.jqueryui.com/slider/
				refreshNumFilteredCompounds();
			},
		});
	});
	databaseSelect.addEventListener('change', refreshDescriptorMinMax);
	[...document.querySelectorAll('[data-bs-toggle="tooltip"]')].forEach(e => new bootstrap.Tooltip(e));
	const qryMolSdfLabel = $('#qryMolSdfLabel');
	document.getElementById('submit').addEventListener('click', () => {
		const qryMolSdfFile = $('#qryMolSdf').get(0).files[0];
		if (qryMolSdfFile === undefined || qryMolSdfFile.size > 500000) {
			qryMolSdfLabel.tooltip('dispose').attr('title', ['Maximum 500KB', 'No file selected'][+!qryMolSdfFile]).tooltip('show');
			return;
		}
		const reader = new FileReader();
		reader.addEventListener('load', async (e) => {
			const response = await fetch('job', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					qryMolSdf: e.target.result,
					filename: qryMolSdfFile.name.substr(0, 20), // A typical ZINC15 sdf filename has 20 characters, e.g. ZINC012345678901.sdf
					database: databaseSelect.value,
					score: document.getElementById('score').value,
				}),
			});
			const res = await response.json();
			if (res.error) {
				qryMolSdfLabel.tooltip('dispose').attr('title', res.error).tooltip('show');
				return;
			}
			location.assign(`result/?id=${res.id}`);
		});
		reader.readAsText(qryMolSdfFile);
	});
	const intro = introJs();
	document.getElementById('tutorial').addEventListener('click', (e) => {
		e.preventDefault();
		intro.start();
	});
});
