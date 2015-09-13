app.factory("Screens", function() {

	var Screens = function() {

		this.setOptions = function(options) {
			var self = this;
			self.options = options;
		};

		this.setSelectedOption = function(option) {
			var self = this;
			self.selectedOption = option;
		};

		// Disable video buttons (Drag me!) and playlist
		this.setFullScreen = function(active) {
			var self = this;
			self.fullScreen = active;
		};

		this.initialize = function() {
			var self = this;
			self.setOptions([1, 2, 4, 6, 9]);
			self.setSelectedOption(4);
			self.setFullScreen(false);
		};

		this.initialize();
	};
	// Return a reference to the function
	return (Screens);
});