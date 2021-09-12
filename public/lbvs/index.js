$(() => {
	$('[data-toggle="tooltip"]').tooltip();
	const qryMolSdfLabel = $('#qryMolSdfLabel');
	$('#submit').click(() => {
		const qryMolSdfFile = $('#qryMolSdf').get(0).files[0];
		if (qryMolSdfFile === undefined || qryMolSdfFile.size > 500000) {
			qryMolSdfLabel.tooltip('dispose').attr('title', ['Maximum 500KB', 'No file selected'][+!qryMolSdfFile]).tooltip('show');
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			$.post('job', {
				qryMolSdf: e.target.result,
				filename: qryMolSdfFile.name.substr(0, 20), // A typical ZINC15 sdf filename has 20 characters, e.g. ZINC012345678901.sdf
				database: $('#database').val(),
				score: $('#score').val(),
			}, (res) => {
				if (res.error) {
					qryMolSdfLabel.tooltip('dispose').attr('title', res.error).tooltip('show');
					return;
				}
				location.assign(`result/?id=${res.id}`);
			});
		};
		reader.readAsText(qryMolSdfFile);
	});
});
