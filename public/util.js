String.prototype.format = function() {
	return this.replace(/\{(\d+)\}/g, (m, i) => { // Lambda function inherits 'this' binding from its enclosing function.
		return arguments[i]; // The arguments variable is from the String.prototype.format, not from the anonymous lambda function.
	});
}
const d3 = /(\d+)(\d{3})/;
Number.prototype.thousandize = function () {
	let s = this.toString();
	while (d3.test(s)) {
		s = s.replace(d3, '$1,$2');
	}
	return s;
};
