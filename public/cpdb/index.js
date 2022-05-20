import databases from './cpdb.js';
$(() => {
	databases.forEach((db) => {
		db.descriptors.forEach((descriptor, index) => {
			const d = [{
				name: 'natm',
				fullName: 'number of atoms',
				xAxisData: ['[3,18)', '[18,20)', '[20,22)', '[22,24)', '[24,26)', '[26,28)', '[28,30)', '[30,+∞)'],
			}, {
				name: 'nhbd',
				fullName: 'number of hydrogen bond donors',
				xAxisData: ['[0,1)', '[1,2)', '[2,3)', '[3,4)', '[4,5)', '[5,6)', '[6,7)', '[7,+∞)'],
			}, {
				name: 'nhba',
				fullName: 'number of hydrogen bond acceptors',
				xAxisData: ['[0,1)', '[1,2)', '[2,3)', '[3,4)', '[4,5)', '[5,6)', '[6,7)', '[7,+∞)'],
			}, {
				name: 'nrtb',
				fullName: 'number of rotatable bonds',
				xAxisData: ['[0,1)', '[1,2)', '[2,3)', '[3,4)', '[4,5)', '[5,6)', '[6,7)', '[7,+∞)'],
			}, {
				name: 'nrng',
				fullName: 'number of rings',
				xAxisData: ['[0,1)', '[1,2)', '[2,3)', '[3,4)', '[4,5)', '[5,6)', '[6,7)', '[7,+∞)'],
			}, {
				name: 'xmwt',
				fullName: 'exact molecular weight',
				xAxisData: ['[0,200)', '[200,250)', '[250,300)', '[300,350)', '[350,400)', '[400,450)', '[450,500)', '[500,+∞)'],
			}, {
				name: 'tpsa',
				fullName: 'topological polar surface area',
				xAxisData: ['[0,20)', '[20,40)', '[40,60)', '[60,80)', '[80,100)', '[100,120)', '[120,140)', '[140,+∞)'],
			}, {
				name: 'clgp',
				fullName: 'octanol-water partition coefficient',
				xAxisData: ['(-∞,-1)', '[-1,0)', '[0,1)', '[1,2)', '[2,3)', '[3,4)', '[4,5)', '[5,+∞)'],
			}][index];
			console.assert(descriptor.name === d.name);
			console.assert(descriptor.seriesData.reduce((acc, cur) => {
				return acc + cur;
			}, 0) === db.numCompounds);
			Object.assign(descriptor, d);
		});
	});
	console.assert(parseInt($('#numDatabases').text()) === databases.length);
	$('#dbTableBody tr').each((trIdx, tr) => {
		const db = databases[trIdx];
		$(tr).children().each((tdIdx, td) => {
			const text = $(td).text();
			console.assert((tdIdx === 3 ? parseInt(text.replace(/,/g, '')) : text) === db[['name', 'version', 'accessDate', 'numCompounds'][tdIdx]]);
		});
	});
	const d3 = /(\d+)(\d{3})/;
	Number.prototype.thousandize = function() {
		let s = this.toString();
		while (d3.test(s)) {
			s = s.replace(d3, '$1,$2');
		}
		return s;
	};
	$('#dbTableBody').click((e) => {
		$('tr', e.currentTarget).removeClass('bg-primary');
		const tr = e.target.parentNode;
		$(tr).addClass('bg-primary');
		const dbName = tr.children[0].innerText;
		const db = databases.find((db) => {
			return db.name === dbName;
		});
		db.descriptors.forEach((descriptor) => {
			const distDiv = document.getElementById(`${descriptor.name}Dist`);
			const distChart = echarts.init(distDiv, 'dark');
			const chartOption = {
				title: {
					text: `${descriptor.fullName}`,
					subtext: `${descriptor.name} ∈ [${descriptor.min}, ${descriptor.max}]`,
					left: 'center',
					top: 20,
				},
				grid: {
					top: 100,
				},
				xAxis: {
					type: 'category',
					data: descriptor.xAxisData,
					axisTick: {
						show: false,
					},				
				},
				yAxis: {
					show: false,
				},
				series: {
					type: 'bar',
					data: descriptor.seriesData,
					label: {
						show: true,
						position: 'top',
						formatter: (params) => {
							return `${params.data.thousandize()}`; // Optionally, append `${(params.data/db.numCompounds*100).toFixed(2)}%` to display percentage as well.
						},
					},
				},
			};
			distChart.setOption(chartOption);
		});
	});
});
