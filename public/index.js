$(() => {
	const intro = introJs();
	$('#tutorial').click((e) => {
		e.preventDefault();
		intro.start();
	});
});
