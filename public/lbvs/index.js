import databases from '../cpdb/cpdb.js';
$(() => {
	const databaseSelect = $('#database');
	$('option', databaseSelect).each((index, option) => {
		const database = databases[index];
		const $option = $(option);
		console.assert(database.name === $option.text());
		$option.text(`${database.name} (# ${database.numCompounds.thousandize()})`);
		$option.val(`${database.name}`);
	});
	const cpdbName = $('#cpdbName');
	function refreshPropertyMinMax() {
		const cpdb = databases.find(cpdb => cpdb.name === databaseSelect.val());
		cpdbName.text(cpdb.name);
		cpdb.descriptors.forEach(descriptor => {
			const { name, min, max } = descriptor;
			$(`#${name}Min`).text(min);
			$(`#${name}Max`).text(max);
			$(`#slider-${name}`).slider({
				range: true,
				min,
				max,
				values: [ min, max ],
				slide: (e, ui) => {
					const { values } = ui;
					$(`#${name}Min`).text(values[0]);
					$(`#${name}Max`).text(values[1]);
				}
			});
		});
	}
	refreshPropertyMinMax();
	databaseSelect.change(refreshPropertyMinMax);
	$('[data-toggle="tooltip"]').tooltip();
	const qryMolSdfLabel = $('#qryMolSdfLabel');
	$('#submit').click(() => {
		const qryMolSdfFile = $('#qryMolSdf').get(0).files[0];
		if (qryMolSdfFile === undefined || qryMolSdfFile.size > 500000) {
			qryMolSdfLabel.tooltip('dispose').attr('title', ['Maximum 500KB', 'No file selected'][+!qryMolSdfFile]).tooltip('show');
			return;
		}
		const reader = new FileReader();
		reader.onload = async (e) => {
			const response = await fetch('job', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					qryMolSdf: e.target.result,
					filename: qryMolSdfFile.name.substr(0, 20), // A typical ZINC15 sdf filename has 20 characters, e.g. ZINC012345678901.sdf
					database: databaseSelect.val(),
					score: $('#score').val(),
				}),
			});
			const res = await response.json();
			if (res.error) {
				qryMolSdfLabel.tooltip('dispose').attr('title', res.error).tooltip('show');
				return;
			}
			location.assign(`result/?id=${res.id}`);
		};
		reader.readAsText(qryMolSdfFile);
	});
	const intro = introJs();
	$('#tutorial').click((e) => {
		e.preventDefault();
		intro.start();
	});
});
