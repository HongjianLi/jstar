import databases from '../cpdb/cpdb.js';
document.addEventListener('DOMContentLoaded', () => {
	const databaseSelect = document.getElementById('database');
	[...databaseSelect.querySelectorAll('option')].forEach((option, index) => {
		const database = databases[index];
		console.assert(database.name === option.value);
		option.text = `${database.name} (# ${database.numCompounds.thousandize()})`;
		option.value = `${database.name}`;
	});
	function refreshPropertyMinMax() {
		const cpdb = databases.find(cpdb => cpdb.name === databaseSelect.value);
		cpdb.descriptors.forEach(descriptor => {
			const { name, min, max } = descriptor;
			document.getElementById(`${name}Min`).innerText = min;
			document.getElementById(`${name}Max`).innerText = max;
			$(`#slider-${name}`).slider({
				range: true,
				min,
				max,
				values: [ min, max ],
				slide: (e, ui) => {
					const { values } = ui;
					document.getElementById(`${name}Min`).innerText = values[0];
					document.getElementById(`${name}Max`).innerText = values[1];
				}
			});
		});
	}
	refreshPropertyMinMax();
	databaseSelect.addEventListener('change', refreshPropertyMinMax);
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
				headers: {
					'Content-Type': 'application/json',
				},
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
