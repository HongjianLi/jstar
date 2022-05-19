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
	}, {
		name: 'SCUBIDOO',
		link: 'http://kolblab.org/scubidoo',
		version: '',
		accessDate: '2019-11-06',
		numCompounds: 20899717,
		descriptors: [{
			name: 'natm',
			min: 8,
			max: 39,
			seriesData: [1049266, 2062378, 3499823, 4438165, 4193349, 3064314, 1668060, 924362],
		}, {
			name: 'nhbd',
			min: 0,
			max: 7,
			seriesData: [3434352, 8607824, 6381091, 2090471, 352241, 31926, 1768, 44],
		}, {
			name: 'nhba',
			min: 0,
			max: 15,
			seriesData: [632, 120544, 1158707, 3823760, 5621010, 4938907, 3069206, 2166951],
		}, {
			name: 'nrtb',
			min: 0,
			max: 7,
			seriesData: [5176, 402469, 2541693, 6125400, 7036707, 3916964, 865555, 5753],
		}, {
			name: 'nrng',
			min: 0,
			max: 10,
			seriesData: [2735, 205242, 3639701, 8716863, 6573390, 1461079, 249232, 51475],
		}, {
			name: 'xmwt',
			min: 111,
			max: 537,
			seriesData: [58510, 1160926, 5021851, 7919690, 5195038, 1399415, 141545, 2742],
		}, {
			name: 'tpsa',
			min: 0,
			max: 228,
			seriesData: [393814, 2333476, 5515364, 6228672, 4120049, 1709536, 483325, 115481],
		}, {
			name: 'clgp',
			min: -4,
			max: 9,
			seriesData: [98952, 475389, 1660651, 3827972, 5635111, 5152881, 2880870, 1167891],
		}],
	},{
		name: 'GDBMedChem',
		link: 'http://gdb.unibe.ch/downloads/',
		version: '',
		accessDate: '2019-07-07',
		numCompounds: 9904832,
		descriptors: [{
			name: 'natm',
			min: 4,
			max: 17,
			seriesData: [9904832, 0, 0, 0, 0, 0, 0, 0],
		}, {
			name: 'nhbd',
			min: 0,
			max: 7,
			seriesData: [2062322, 3753940, 2546460, 1135687, 342704, 58530, 4934, 255],
		}, {
			name: 'nhba',
			min: 0,
			max: 7,
			seriesData: [1420939, 2657905, 2494141, 1884029, 1027301, 338026, 73318, 9173],
		}, {
			name: 'nrtb',
			min: 0,
			max: 13,
			seriesData: [1667909, 2126669, 2025634, 1610759, 1110502, 680320, 376499, 306540],
		}, {
			name: 'nrng',
			min: 0,
			max: 4,
			seriesData: [511184, 3726774, 4634230, 1032634, 10, 0, 0, 0],
		}, {
			name: 'xmwt',
			min: 51,
			max: 314,
			seriesData: [5256503, 4507835, 140479, 15, 0, 0, 0, 0],
		}, {
			name: 'tpsa',
			min: 0,
			max: 175,
			seriesData: [1772598, 2656695, 2556723, 1824764, 834918, 222673, 33628, 2833],
		}, {
			name: 'clgp',
			min: -8,
			max: 7,
			seriesData: [1924902, 1631616, 1924324, 1838608, 1408545, 826056, 305921, 44860],
		}],
	},{
		name: 'ChEMBL',
		link: 'https://www.ebi.ac.uk/chembl/',
		version: '25',
		accessDate: '2019-07-19',
		numCompounds: 1828196,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 69,
			seriesData: [125736, 94906, 136608, 173848, 197742, 192383, 181504, 725469],
		}, {
			name: 'nhbd',
			min: 0,
			max: 25,
			seriesData: [379098, 656012, 445897, 188179, 80488, 32312, 18270, 27940],
		}, {
			name: 'nhba',
			min: 0,
			max: 39,
			seriesData: [4384, 31155, 123951, 248537, 343173, 346871, 281310, 448815],
		}, {
			name: 'nrtb',
			min: 0,
			max: 58,
			seriesData: [28954, 73176, 149998, 223764, 271655, 264353, 233836, 582460],
		}, {
			name: 'nrng',
			min: 0,
			max: 28,
			seriesData: [19967, 86426, 305973, 559058, 494053, 242209, 79881, 40629],
		}, {
			name: 'xmwt',
			min: 20,
			max: 1751,
			seriesData: [34546, 85867, 194787, 320869, 337983, 305795, 223597, 324752],
		}, {
			name: 'tpsa',
			min: 0,
			max: 1123,
			seriesData: [38149, 167381, 359316, 434516, 356400, 218057, 109216, 145161],
		}, {
			name: 'clgp',
			min: -47,
			max: 23,
			seriesData: [35940, 34798, 82672, 199978, 364393, 436730, 341920, 331765],
		}],
	},{
		name: 'ChemDiv',
		link: 'https://www.chemdiv.com/',
		version: '',
		accessDate: '2019-09-11',
		numCompounds: 1382874,
		descriptors: [{
			name: 'natm',
			min: 5,
			max: 69,
			seriesData: [30230, 31102, 57567, 98895, 150452, 194552, 218870, 601206],
		}, {
			name: 'nhbd',
			min: 0,
			max: 11,
			seriesData: [368570, 712433, 259088, 38642, 3538, 377, 151, 75],
		}, {
			name: 'nhba',
			min: 0,
			max: 24,
			seriesData: [305, 8622, 57476, 160097, 270157, 313362, 267423, 305432],
		}, {
			name: 'nrtb',
			min: 0,
			max: 38,
			seriesData: [4061, 20285, 72281, 159685, 235207, 270788, 237424, 383143],
		}, {
			name: 'nrng',
			min: 0,
			max: 14,
			seriesData: [935, 17606, 124456, 425786, 571150, 208479, 29839, 4623],
		}, {
			name: 'xmwt',
			min: 82,
			max: 1118,
			seriesData: [7062, 23119, 73721, 195568, 347972, 374370, 247081, 113981],
		}, {
			name: 'tpsa',
			min: 0,
			max: 464,
			seriesData: [6488, 81849, 309950, 474639, 343319, 123924, 31696, 11009],
		}, {
			name: 'clgp',
			min: -6,
			max: 18,
			seriesData: [1283, 6305, 32459, 108322, 248346, 368624, 346727, 270808],
		}],
	},{
		name: 'Specs',
		link: 'https://www.specs.net/',
		version: '',
		accessDate: '2019-09-01',
		numCompounds: 683539,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 69,
			seriesData: [84078, 50483, 65625, 76004, 79996, 79783, 74898, 172672],
		}, {
			name: 'nhbd',
			min: 0,
			max: 15,
			seriesData: [160016, 328432, 157384, 30567, 5697, 749, 439, 255],
		}, {
			name: 'nhba',
			min: 0,
			max: 24,
			seriesData: [2116, 21116, 79246, 127745, 146049, 119487, 89084, 98696],
		}, {
			name: 'nrtb',
			min: 0,
			max: 57,
			seriesData: [11906, 30185, 63631, 100614, 118961, 112690, 88854, 156698],
		}, {
			name: 'nrng',
			min: 0,
			max: 18,
			seriesData: [3585, 53858, 184650, 216457, 154403, 52471, 12538,5577],
		}, {
			name: 'xmwt',
			min: 40,
			max: 1252,
			seriesData: [29580, 49151, 90724, 128665, 142226, 119421, 73597, 50175],
		}, {
			name: 'tpsa',
			min: 0,
			max: 426,
			seriesData: [15406, 97242, 174978, 190268, 126615, 51854, 18315, 8861],
		}, {
			name: 'clgp',
			min: -10,
			max: 24,
			seriesData: [2291, 6438, 23059, 62726, 125537, 178274, 147656, 137558],
		}],
	},{
		name: 'SuperNatural',
		link: 'http://bioinf-applied.charite.de/supernatural_new/',
		version: '2',
		accessDate: '2019-11-06',
		numCompounds: 311682,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 69,
			seriesData: [33651, 15433, 17561, 23639, 25760, 26386, 25849, 143403],
		}, {
			name: 'nhbd',
			min: 0,
			max: 21,
			seriesData: [73008, 82978, 60069, 30420, 18161, 12252, 10268, 24526],
		}, {
			name: 'nhba',
			min: 0,
			max: 35,
			seriesData: [3828, 14665, 28882, 36481, 43854, 43202, 39212, 101558],
		}, {
			name: 'nrtb',
			min: 0,
			max: 59,
			seriesData: [19492, 28660, 33113, 34878, 38257, 35881, 30326, 91075],
		}, {
			name: 'nrng',
			min: 0,
			max: 18,
			seriesData: [15325, 26092, 46061, 67134, 70331, 46005, 21037, 19697],
		}, {
			name: 'xmwt',
			min: 43,
			max: 1235,
			seriesData: [14625, 20685, 29581, 44537, 46973, 48101, 35556, 71624],
		}, {
			name: 'tpsa',
			min: 0,
			max: 621,
			seriesData: [10848, 33696, 52337, 58549, 46331, 32708, 20023, 57190],
		}, {
			name: 'clgp',
			min: -15,
			max: 25,
			seriesData: [22630, 16999, 26166, 40101, 52077, 52349, 42001, 59359],
		}],
	},{
		name: 'SureChEMBL',
		link: 'https://www.surechembl.org/',
		version: 'Q1 2019',
		accessDate: '2020-04-17',
		numCompounds: 286451,
		descriptors: [{
			name: 'natm',
			min: 4,
			max: 69,
			seriesData: [43608, 13596, 13208, 14070, 15934, 18786, 19823, 147426],
		}, {
			name: 'nhbd',
			min: 0,
			max: 23,
			seriesData: [82233, 86710, 64012, 30840, 13567, 4000, 2155, 2934],
		}, {
			name: 'nhba',
			min: 0,
			max: 31,
			seriesData: [2541, 14477, 27697, 37544, 43118, 39748, 35667, 85659],
		}, {
			name: 'nrtb',
			min: 0,
			max: 57,
			seriesData: [7063, 13853, 24442, 33461, 39034, 37778, 31660, 99160],
		}, {
			name: 'nrng',
			min: 0,
			max: 30,
			seriesData: [12504, 29408, 42776, 48085, 55307, 41484, 20317, 36570],
		}, {
			name: 'xmwt',
			min: 99,
			max: 1575,
			seriesData: [18676, 21326, 24317, 27344, 33900, 36967, 32300, 91621],
		}, {
			name: 'tpsa',
			min: 0,
			max: 553,
			seriesData: [23991, 37904, 47643, 50728, 48417, 33910, 19921, 23937],
		}, {
			name: 'clgp',
			min: -14,
			max: 21,
			seriesData: [3940, 5661, 13648, 29719, 48237, 54276, 44258, 86712],
		}],
	},{
		name: 'COCONUT',
		link: 'https://coconut.naturalproducts.net/',
		version: '3',
		accessDate: '2020-04-11',
		numCompounds: 198224,
		descriptors: [{
			name: 'natm',
			min: 6,
			max: 69,
			seriesData: [23848, 9223, 10963, 14088, 16164, 16681, 16329, 90928],
		}, {
			name: 'nhbd',
			min: 0,
			max: 20,
			seriesData: [38799, 50273, 41464, 22745, 13286, 8605, 7427, 15625],
		}, {
			name: 'nhba',
			min: 0,
			max: 35,
			seriesData: [2319, 7933, 16325, 22701, 28841, 29507, 25258, 65340],
		}, {
			name: 'nrtb',
			min: 0,
			max: 59,
			seriesData: [10241, 15260, 18663, 21442, 23507, 23055, 20283, 65773],
		}, {
			name: 'nrng',
			min: 0,
			max: 19,
			seriesData: [10727, 17089, 29293, 41391, 43607, 26284, 13308, 16525],
		}, {
			name: 'xmwt',
			min: 78,
			max: 1626,
			seriesData: [12027, 12230, 18207, 26970, 29819, 28869, 20503, 49599],
		}, {
			name: 'tpsa',
			min: 0,
			max: 621,
			seriesData: [6337, 18452, 30996, 38231, 30388, 22028, 13556, 38236],
		}, {
			name: 'clgp',
			min: -15,
			max: 24,
			seriesData: [12447, 10699, 18376, 27165, 34457, 32999, 24649, 37432],
		}],
	},{
		name: 'Pfizer',
		link: 'https://www.pfizer.com/',
		version: '',
		accessDate: '2019-08-19',
		numCompounds: 105864,
		descriptors: [{
			name: 'natm',
			min: 9,
			max: 37,
			seriesData: [2513, 3874, 7893, 13151, 17382, 18924, 17152, 24975],
		}, {
			name: 'nhbd',
			min: 0,
			max: 5,
			seriesData: [27663, 55930, 19539, 2492, 231, 9, 0, 0],
		}, {
			name: 'nhba',
			min: 1,
			max: 11,
			seriesData: [0, 534, 3963, 13418, 22837, 26914, 21181, 17017],
		}, {
			name: 'nrtb',
			min: 0,
			max: 8,
			seriesData: [341, 2134, 6582, 13715, 21715, 25518, 23731, 12128],
		}, {
			name: 'nrng',
			min: 1,
			max: 8,
			seriesData: [0, 178, 13623, 46512, 36107, 8436, 889, 119],
		}, {
			name: 'xmwt',
			min: 123,
			max: 500,
			seriesData: [279, 1887, 8746, 23321, 32067, 26020, 13544, 0],
		}, {
			name: 'tpsa',
			min: 3,
			max: 148,
			seriesData: [239, 5632, 24879, 37877, 25833, 9825, 1552, 27],
		}, {
			name: 'clgp',
			min: -3,
			max: 8,
			seriesData: [59, 455, 2299, 9084, 23245, 35480, 27918, 7324],
		}],
	},{
		name: 'NPASS',
		link: 'http://bidd2.nus.edu.sg/NPASS/',
		version: '1.0',
		accessDate: '2019-03-28',
		numCompounds: 29295,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 69,
			seriesData: [4248, 1664, 1818, 2433, 2369, 2120, 1737, 12906],
		}, {
			name: 'nhbd',
			min: 0,
			max: 17,
			seriesData: [4832, 6894, 6529, 3908, 2380, 1462, 1078, 2212],
		}, {
			name: 'nhba',
			min: 0,
			max: 28,
			seriesData: [285, 1461, 3015, 3642, 4034, 3726, 3168, 9964],
		}, {
			name: 'nrtb',
			min: 0,
			max: 42,
			seriesData: [2675, 3679, 3795, 3200, 3185, 2644, 2243, 7874],
		}, {
			name: 'nrng',
			min: 0,
			max: 17,
			seriesData: [1596, 3028, 4728, 6723, 5508, 3992, 1975, 1745],
		}, {
			name: 'xmwt',
			min: 41,
			max: 1184,
			seriesData: [2475, 2039, 3139, 4320, 3441, 3349, 3082, 7450],
		}, {
			name: 'tpsa',
			min: 0,
			max: 559,
			seriesData: [906, 2915, 5047, 5431, 4111, 3160, 1959, 5766],
		}, {
			name: 'clgp',
			min: -11,
			max: 18,
			seriesData: [1461, 1219, 1995, 3511, 5176, 5009, 4170, 6754],
		}],
	},{
		name: 'MedChemExpress',
		link: 'https://www.medchemexpress.com/',
		version: '',
		accessDate: '2019-08-19',
		numCompounds: 14458,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 69,
			seriesData: [8998, 439, 433, 452, 483, 561, 567, 2525],
		}, {
			name: 'nhbd',
			min: 0,
			max: 22,
			seriesData: [3911, 5743, 3013, 983, 416, 146, 106, 140],
		}, {
			name: 'nhba',
			min: 0,
			max: 26,
			seriesData: [167, 2300, 4379, 2864, 1215, 937, 882, 1714],
		}, {
			name: 'nrtb',
			min: 0,
			max: 41,
			seriesData: [3243, 3491, 1933, 1289, 1088, 821, 710, 1883],
		}, {
			name: 'nrng',
			min: 0,
			max: 12,
			seriesData: [906, 5854, 3163, 1666, 1572, 828, 330, 139],
		}, {
			name: 'xmwt',
			min: 45,
			max: 1140,
			seriesData: [6117, 2424, 1158, 804, 994, 953, 700, 1308],
		}, {
			name: 'tpsa',
			min: 0,
			max: 448,
			seriesData: [1329, 4469, 3721, 1753, 1269, 808, 426, 683],
		}, {
			name: 'clgp',
			min: -18,
			max: 19,
			seriesData: [440, 690, 1664, 3757, 3929, 1768, 1082, 1128],
		}],
	},{
		name: 'Selleckchem',
		link: 'https://www.selleckchem.com/',
		version: '',
		accessDate: '2020-03-17',
		numCompounds: 9930,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 69,
			seriesData: [2701, 559, 738, 930, 936, 846, 775, 2445],
		}, {
			name: 'nhbd',
			min: 0,
			max: 17,
			seriesData: [1939, 3769, 2382, 864, 397, 178, 122, 279],
		}, {
			name: 'nhba',
			min: 0,
			max: 39,
			seriesData: [44, 576, 1201, 1587, 1760, 1580, 1239, 1943],
		}, {
			name: 'nrtb',
			min: 0,
			max: 30,
			seriesData: [644, 1074, 1331, 1387, 1452, 1206, 1055, 1781],
		}, {
			name: 'nrng',
			min: 0,
			max: 12,
			seriesData: [446, 1589, 1608, 2873, 2133, 887, 246, 148],
		}, {
			name: 'xmwt',
			min: 46,
			max: 2988,
			seriesData: [1824, 806, 1207, 1466, 1551, 1293, 758, 1025],
		}, {
			name: 'tpsa',
			min: 0,
			max: 734,
			seriesData: [305, 1317, 2225, 2337, 1671, 850, 373, 852],
		}, {
			name: 'clgp',
			min: -30,
			max: 15,
			seriesData: [613, 368, 825, 1592, 1967, 2139, 1575, 851],
		}],
	},{
		name: 'DrugBank',
		link: 'https://www.drugbank.ca/',
		version: '5.1.6',
		accessDate: '2020-05-10',
		numCompounds: 8802,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 50,
			seriesData: [2558, 616, 758, 785, 698, 696, 705, 1986],
		}, {
			name: 'nhbd',
			min: 0,
			max: 16,
			seriesData: [1215, 2365, 2314, 1345, 750, 343, 206, 264],
		}, {
			name: 'nhba',
			min: 0,
			max: 23,
			seriesData: [69, 460, 1224, 1480, 1450, 1245, 1033, 1841],
		}, {
			name: 'nrtb',
			min: 0,
			max: 15,
			seriesData: [548, 701, 1061, 1120, 1164, 1022, 912, 2274],
		}, {
			name: 'nrng',
			min: 0,
			max: 11,
			seriesData: [950, 1435, 1886, 2073, 1554, 654, 180, 70],
		}, {
			name: 'xmwt',
			min: 41,
			max: 1269,
			seriesData: [1468, 938, 1232, 1346, 1287, 1066, 680, 785],
		}, {
			name: 'tpsa',
			min: 0,
			max: 411,
			seriesData: [378, 1015, 1433, 1614, 1600, 1185, 564, 1013],
		}, {
			name: 'clgp',
			min: -10,
			max: 13,
			seriesData: [1020, 628, 947, 1301, 1517, 1521, 1087, 781],
		}],
	},{
		name: 'GtoPdb',
		link: 'https://www.guidetopharmacology.org',
		version: '2020.2',
		accessDate: '2020-05-05',
		numCompounds: 7517,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 69,
			seriesData: [1097, 332, 508, 556, 652, 705, 719, 2948],
		}, {
			name: 'nhbd',
			min: 0,
			max: 14,
			seriesData: [1083, 2257, 2031, 1124, 507, 205, 111, 199],
		}, {
			name: 'nhba',
			min: 0,
			max: 32,
			seriesData: [20, 265, 861, 1203, 1296, 1176, 919, 1777],
		}, {
			name: 'nrtb',
			min: 0,
			max: 40,
			seriesData: [251, 423, 755, 829, 919, 868, 794, 2678],
		}, {
			name: 'nrng',
			min: 0,
			max: 13,
			seriesData: [478, 698, 1098, 1808, 1964, 985, 311, 175],
		}, {
			name: 'xmwt',
			min: 44,
			max: 1140,
			seriesData: [598, 476, 719, 1030, 1252, 1189, 867, 1386],
		}, {
			name: 'tpsa',
			min: 0,
			max: 556,
			seriesData: [227, 776, 1343, 1568, 1357, 970, 516, 760],
		}, {
			name: 'clgp',
			min: -10,
			max: 12,
			seriesData: [386, 295, 451, 729, 1252, 1655, 1350, 1399],
		}],
	},{
		name: 'TargetMol',
		link: 'https://www.targetmol.com/',
		version: '',
		accessDate: '2019-09-05',
		numCompounds: 5690,
		descriptors: [{
			name: 'natm',
			min: 4,
			max: 69,
			seriesData: [1187, 330, 408, 427, 453, 444, 441, 2000],
		}, {
			name: 'nhbd',
			min: 0,
			max: 19,
			seriesData: [860, 1598, 1442, 756, 377, 210, 123, 324],
		}, {
			name: 'nhba',
			min: 0,
			max: 28,
			seriesData: [25, 242, 612, 806, 886, 767, 695, 1657],
		}, {
			name: 'nrtb',
			min: 0,
			max: 35,
			seriesData: [377, 463, 705, 722, 779, 608, 542, 1494],
		}, {
			name: 'nrng',
			min: 0,
			max: 14,
			seriesData: [328, 700, 1015, 1335, 1194, 655, 275, 188],
		}, {
			name: 'xmwt',
			min: 60,
			max: 1059,
			seriesData: [675, 469, 614, 769, 805, 748, 545, 1065],
		}, {
			name: 'tpsa',
			min: 0,
			max: 577,
			seriesData: [165, 578, 967, 1112, 965, 689, 321, 893],
		}, {
			name: 'clgp',
			min: -20,
			max: 18,
			seriesData: [594, 321, 475, 699, 942, 1096, 790, 773],
		}],
	},{
		name: 'PADFrag',
		link: 'http://chemyang.ccnu.edu.cn/ccb/database/PADFrag/',
		version: '201701',
		accessDate: '2020-01-21',
		numCompounds: 5469,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 65,
			seriesData: [4493, 247, 202, 131, 116, 84, 72, 124],
		}, {
			name: 'nhbd',
			min: 0,
			max: 14,
			seriesData: [2133, 2373, 871, 59, 17, 4, 2, 10],
		}, {
			name: 'nhba',
			min: 0,
			max: 20,
			seriesData: [238, 1297, 1967, 1080, 362, 229, 131, 165],
		}, {
			name: 'nrtb',
			min: 0,
			max: 30,
			seriesData: [1085, 1213, 1302, 1038, 228, 186, 161, 256],
		}, {
			name: 'nrng',
			min: 0,
			max: 8,
			seriesData: [1049, 2419, 1468, 409, 75, 19, 20, 10],
		}, {
			name: 'xmwt',
			min: 40,
			max: 985,
			seriesData: [3631, 709, 389, 297, 193, 118, 57, 75],
		}, {
			name: 'tpsa',
			min: 0,
			max: 408,
			seriesData: [973, 2014, 1893, 281, 135, 80, 25, 68],
		}, {
			name: 'clgp',
			min: -29,
			max: 14,
			seriesData: [98, 471, 1071, 1754, 1186, 416, 254, 219],
		}],
	},{
		name: 'TTD',
		link: 'http://db.idrblab.net/ttd/',
		version: '2020',
		accessDate: '2019-08-29',
		numCompounds: 5429,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 69,
			seriesData: [909, 317, 359, 439, 428, 449, 463, 2065],
		}, {
			name: 'nhbd',
			min: 0,
			max: 19,
			seriesData: [909, 1550, 1368, 709, 391, 185, 106, 211],
		}, {
			name: 'nhba',
			min: 0,
			max: 29,
			seriesData: [34, 189, 543, 793, 890, 767, 680, 1533],
		}, {
			name: 'nrtb',
			min: 0,
			max: 41,
			seriesData: [273, 332, 587, 584, 619, 594, 557, 1883],
		}, {
			name: 'nrng',
			min: 0,
			max: 11,
			seriesData: [331, 575, 1001, 1348, 1213, 607, 197, 157],
		}, {
			name: 'xmwt',
			min: 46,
			max: 2663,
			seriesData: [423, 417, 599, 759, 827, 731, 525, 1148],
		}, {
			name: 'tpsa',
			min: 0,
			max: 585,
			seriesData: [220, 571, 843, 1013, 925, 653, 367, 837],
		}, {
			name: 'clgp',
			min: -27,
			max: 19,
			seriesData: [497, 320, 442, 706, 935, 1017, 738, 774],
		}],
	},{
		name: 'HybridMolDB',
		link: 'http://www.idruglab.com/HybridMolDB/index.php',
		version: '1',
		accessDate: '2019-10-28',
		numCompounds: 4600,
		descriptors: [{
			name: 'natm',
			min: 11,
			max: 69,
			seriesData: [12, 43, 121, 186, 281, 256, 354, 3347],
		}, {
			name: 'nhbd',
			min: 0,
			max: 15,
			seriesData: [1084, 1171, 1203, 503, 296, 61, 174, 108],
		}, {
			name: 'nhba',
			min: 0,
			max: 20,
			seriesData: [8, 15, 137, 309, 554, 577, 624, 2376],
		}, {
			name: 'nrtb',
			min: 0,
			max: 35,
			seriesData: [39, 106, 111, 262, 376, 381, 464, 2861],
		}, {
			name: 'nrng',
			min: 0,
			max: 15,
			seriesData: [21, 36, 300, 753, 1208, 910, 724, 648],
		}, {
			name: 'xmwt',
			min: 163,
			max: 1455,
			seriesData: [5, 11, 157, 357, 473, 561, 609, 2427],
		}, {
			name: 'tpsa',
			min: 3,
			max: 436,
			seriesData: [22, 348, 528, 991, 847, 712, 413, 739],
		}, {
			name: 'clgp',
			min: -6,
			max: 16,
			seriesData: [76, 39, 97, 287, 440, 626, 785, 2250],
		}],
	},{
		name: 'SWEETLEAD',
		link: 'https://simtk.org/projects/sweetlead',
		version: '1.0',
		accessDate: '2019-08-28',
		numCompounds: 4208,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 69,
			seriesData: [1186, 306, 375, 391, 312, 322, 240, 1076],
		}, {
			name: 'nhbd',
			min: 0,
			max: 17,
			seriesData: [953, 1302, 933, 391, 245, 141, 85, 158],
		}, {
			name: 'nhba',
			min: 0,
			max: 28,
			seriesData: [178, 422, 661, 678, 555, 425, 371, 918],
		}, {
			name: 'nrtb',
			min: 0,
			max: 53,
			seriesData: [428, 476, 539, 509, 549, 376, 326, 1005],
		}, {
			name: 'nrng',
			min: 0,
			max: 11,
			seriesData: [395, 704, 868, 858, 722, 365, 152, 144],
		}, {
			name: 'xmwt',
			min: 43,
			max: 1626,
			seriesData: [701, 489, 600, 634, 534, 420, 272, 558],
		}, {
			name: 'tpsa',
			min: 0,
			max: 487,
			seriesData: [367, 711, 829, 633, 485, 401, 197, 585],
		}, {
			name: 'clgp',
			min: -14,
			max: 21,
			seriesData: [643, 338, 527, 717, 760, 502, 310, 411],
		}],
	},{
		name: 'SuperDRUG',
		link: 'http://cheminfo.charite.de/superdrug2/',
		version: '2',
		accessDate: '2019-03-27',
		numCompounds: 3864,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 69,
			seriesData: [1020, 343, 373, 412, 314, 288, 235, 879],
		}, {
			name: 'nhbd',
			min: 0,
			max: 16,
			seriesData: [880, 1168, 930, 417, 226, 90, 56, 97],
		}, {
			name: 'nhba',
			min: 0,
			max: 25,
			seriesData: [46, 233, 618, 720, 679, 466, 391, 711],
		}, {
			name: 'nrtb',
			min: 0,
			max: 35,
			seriesData: [219, 283, 500, 507, 502, 427, 377, 1049],
		}, {
			name: 'nrng',
			min: 0,
			max: 11,
			seriesData: [299, 693, 938, 882, 654, 254, 77, 67],
		}, {
			name: 'xmwt',
			min: 43,
			max: 1626,
			seriesData: [503, 443, 681, 650, 512, 356, 250, 469],
		}, {
			name: 'tpsa',
			min: 0,
			max: 416,
			seriesData: [303, 640, 778, 665, 502, 384, 186, 406],
		}, {
			name: 'clgp',
			min: -11,
			max: 18,
			seriesData: [261, 211, 409, 615, 729, 702, 514, 423],
		}],
	},{
		name: 'Biopurify',
		link: 'http://www.biopurify.com/',
		version: '',
		accessDate: '2020-03-13',
		numCompounds: 2103,
		descriptors: [{
			name: 'natm',
			min: 7,
			max: 69,
			seriesData: [282, 88, 130, 141, 167, 165, 116, 1014],
		}, {
			name: 'nhbd',
			min: 0,
			max: 20,
			seriesData: [307, 347, 364, 188, 168, 146, 130, 453],
		}, {
			name: 'nhba',
			min: 0,
			max: 31,
			seriesData: [6, 81, 142, 196, 243, 220, 201, 1014],
		}, {
			name: 'nrtb',
			min: 0,
			max: 28,
			seriesData: [187, 235, 254, 247, 255, 190, 177, 558],
		}, {
			name: 'nrng',
			min: 0,
			max: 14,
			seriesData: [72, 162, 243, 436, 408, 339, 205, 238],
		}, {
			name: 'xmwt',
			min: 100,
			max: 991,
			seriesData: [176, 137, 193, 281, 248, 235, 195, 638],
		}, {
			name: 'tpsa',
			min: 0,
			max: 507,
			seriesData: [31, 168, 336, 303, 213, 174, 137, 741],
		}, {
			name: 'clgp',
			min: -15,
			max: 15,
			seriesData: [328, 137, 205, 284, 399, 338, 183, 229],
		}],
	},{
		name: 'EK-DRD',
		link: 'http://www.idruglab.com/drd/index.php',
		version: '1',
		accessDate: '2019-10-29',
		numCompounds: 1870,
		descriptors: [{
			name: 'natm',
			min: 3,
			max: 69,
			seriesData: [484, 149, 171, 193, 155, 138, 122, 458],
		}, {
			name: 'nhbd',
			min: 0,
			max: 17,
			seriesData: [378, 547, 459, 226, 128, 49, 28, 55],
		}, {
			name: 'nhba',
			min: 0,
			max: 23,
			seriesData: [15, 108, 296, 329, 311, 235, 191, 385],
		}, {
			name: 'nrtb',
			min: 0,
			max: 38,
			seriesData: [129, 139, 258, 219, 234, 219, 162, 510],
		}, {
			name: 'nrng',
			min: 0,
			max: 10,
			seriesData: [171, 302, 411, 440, 344, 123, 42, 37],
		}, {
			name: 'xmwt',
			min: 43,
			max: 1550,
			seriesData: [252, 198, 291, 307, 262, 185, 123, 252],
		}, {
			name: 'tpsa',
			min: 0,
			max: 543,
			seriesData: [139, 269, 339, 328, 280, 180, 98, 237],
		}, {
			name: 'clgp',
			min: -16,
			max: 11,
			seriesData: [183, 126, 202, 273, 333, 318, 249, 186],
		}],
	},{
		name: 'WITHDRAWN',
		link: 'http://cheminfo.charite.de/withdrawn/',
		version: 'Sep 2015',
		accessDate: '2020-01-21',
		numCompounds: 613,
		descriptors: [{
			name: 'natm',
			min: 4,
			max: 66,
			seriesData: [152, 53, 71, 63, 67, 48, 28, 131],
		}, {
			name: 'nhbd',
			min: 0,
			max: 15,
			seriesData: [155, 186, 163, 39, 36, 18, 7, 9],
		}, {
			name: 'nhba',
			min: 0,
			max: 21,
			seriesData: [9, 40, 112, 132, 105, 56, 62, 97],
		}, {
			name: 'nrtb',
			min: 0,
			max: 35,
			seriesData: [36, 37, 94, 82, 94, 66, 58, 146],
		}, {
			name: 'nrng',
			min: 0,
			max: 10,
			seriesData: [23, 108, 162, 153, 111, 35, 9, 12],
		}, {
			name: 'xmwt',
			min: 62,
			max: 943,
			seriesData: [65, 78, 113, 114, 77, 61, 35, 70],
		}, {
			name: 'tpsa',
			min: 0,
			max: 428,
			seriesData: [60, 115, 140, 91, 64, 60, 24, 59],
		}, {
			name: 'clgp',
			min: -10,
			max: 13,
			seriesData: [35, 26, 52, 102, 132, 121, 84, 61],
		}],
	}].map((db) => {
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
