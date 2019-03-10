const spectrumSettings = {
	containerClassName: "border-light bg-dark rounded",
	replacerClassName: "btn btn-square border-light rounded-left",
	showInput: true,
	showInitial: true,
	showPalette: true,
	showSelectionPalette: true,
	maxSelectionSize: 10,
	preferredFormat: "hex",
	localStorageKey: "discord-color-picker.spectrum",
	palette: [
		['#99aab5', '#ffffff', '#808080', '#000000'],
		['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#e91e63', '#f1c40f', '#e74c3c', '#95a5a6', '#607d8b'],
		['#11806a', '#1f8b4c', '#206694', '#71368a', '#ad1457', '#c27c0e', '#992d22', '#979c9f', '#546e7a'],
		[]
	]
};

function generateId(){
	function rand(){ return Math.random().toString(16).slice(-4); }
	return rand() + rand() +
		'-' + rand() +
		'-' + rand() +
		'-' + rand() +
		'-' + rand() + rand() + rand();
}
function copyHex(hex) {
	let e = document.createElement('textarea');
	e.value = hex.toUpperCase();
	document.body.appendChild(e);
	e.select();
	document.execCommand('copy');
	document.body.removeChild(e);
}

function saveColors () {
	localStorage.setItem('discord-color-picker.colors', JSON.stringify(root.colors().map(v => ({color: v.colorHex(), name: v.name()}))))
}
function loadColors() {
	return JSON.parse(localStorage.getItem('discord-color-picker.colors') || 'null');
}

function ColorModel(color, name) {
	let self = this;

	self.id = generateId();

	self.colorHex = ko.observable(color || '#99AAB5');
	self.colorHex.subscribe(()=>saveColors());

	self.name = ko.observable(name || 'Username');
	self.name.subscribe(()=>saveColors());

	self.copyColor = function () { copyHex(self.colorHex()); };
	self.addSpectrum = function (e,d) {
		$("#spectrum-"+self.id).spectrum(Object.assign(spectrumSettings, {
			color: d.colorHex(),
			move: c=>{d.colorHex(('#'+c.toHex(false)).toUpperCase())}
		}));
	}
}

function RootViewModel() {
	let self = this;
	let savedColor = loadColors() || [{color:'#99aab5',name:'username'}];

	self.hideInstructions = ko.observable(localStorage.getItem('discord-color-picker.hideInstructions') === 'true');
	self.hideInstructions.subscribe(function (value) {
		localStorage.setItem('discord-color-picker.hideInstructions', value);
	});

	self.colors = ko.observableArray(savedColor.map(v => new ColorModel(v.color, v.name)));
	self.colors.subscribe(function(changes){
		saveColors();
	}, null, "arrayChange");


	self.addColor = function () {
		self.colors.push(new ColorModel());
	};
	self.removeColor = function (item) {
		self.colors().length>1 && self.colors.remove(item);
	};
	self.cloneColor = function (item) {
		let newIndex = self.colors.indexOf(item)+1;
		self.colors.splice(newIndex, 0, new ColorModel(item.colorHex(), item.name()));
	};

	self.resetSpectrum = function () {
		localStorage.removeItem('discord-color-picker.spectrum');
		location.reload();
	};
	self.resetSavedColors = function () {
		localStorage.removeItem('discord-color-picker.colors');
		location.reload();
	};
	self.resetAll = function () {
		localStorage.removeItem('discord-color-picker.spectrum');
		localStorage.removeItem('discord-color-picker.colors');
		location.reload();
	}
}

$("#spectrum-example").spectrum(Object.assign(spectrumSettings, {
	color: '#99AAB5'
}));

let root = new RootViewModel();
ko.applyBindings(root);