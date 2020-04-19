$(() => {
	const databases = [{
		name: 'ZINC',
		link: 'https://zinc15.docking.org/',
		version: '15',
		accessDate: '2019-03-27',
		numCompounds: 265450385,
		descriptors: [{
			name: 'natm',
			min: 4,
			max: 59,
			seriesData: [12622383, 22133607, 42909474, 63496201, 78339974, 28351951, 9976321, 7620474],
		}, {
			name: 'nhbd',
			min: 0,
			max: 16,
			seriesData: [56959062, 112001641, 72607704, 20969999, 2706340, 195386, 7684, 2569],
		}, {
			name: 'nhba',
			min: 0,
			max: 27,
			seriesData: [22650, 3417637, 24782038, 55915338, 70363656, 56959574, 32872039, 21117453],
		}, {
			name: 'nrtb',
			min: 0,
			max: 42,
			seriesData: [239670, 4224844, 17706670, 38858782, 55429530, 55465809, 42648802, 50876278],
		}, {
			name: 'nrng',
			min: 0,
			max: 22,
			seriesData: [1715524, 25617556, 94665811, 104231479, 34878459, 3898936, 369340, 73280],
		}, {
			name: 'xmwt',
			min: 52,
			max: 991,
			seriesData: [1375887, 9642599, 50297705, 122479842, 67127004, 10882360, 2609907, 1035081],
		}, {
			name: 'tpsa',
			min: 0,
			max: 520,
			seriesData: [743507, 21316698, 72735399, 85386502, 56189872, 22079002, 6055369, 944036],
		}, {
			name: 'clgp',
			min: -18,
			max: 18,
			seriesData: [4704343, 18126455, 37118825, 42263030, 76347306, 66597377, 18784300, 1508749],
		}],
	}/*, {
		name: 'SCUBIDOO',
		link: 'http://kolblab.org/scubidoo',
		version: '',
		accessDate: '2019-11-06',
		numCompounds: 20899717,
	}*/].map((db) => {
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
		return db;
	});
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
					},
				},
			};
			distChart.setOption(chartOption);
		});
	});
});
