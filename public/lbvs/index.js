$(() => {
	$('[data-toggle="tooltip"]').tooltip();
	const query_label = $('#query_label');
	$('#submit').click(() => {
		const file = $('#query').get(0).files[0];
		if (file === undefined || file.size > 50000) {
			query_label.tooltip('dispose').attr('title', ['Maximum 50KB', 'No file selected'][+!file]).tooltip('show');
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			$.post('job', {
				query: reader.result,
				name: file.name.substr(0, 20),
				database: $('#database').val(),
				score: $('#score').val(),
			}, (res) => {
				console.log(res);
				if (res.error) {
					query_label.tooltip('dispose').attr('title', res.error).tooltip('show');
					return;
				}
				location.assign(`result/?id=${res.id}`);
			});
		};
		reader.readAsText(file);
	});
});
