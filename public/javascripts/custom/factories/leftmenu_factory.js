app.factory("LeftMenu", function() {

	var LeftMenu = function() {

		this.setActive = function(active) {
			var self = this;
			self.active = active;
		};

		this.initialize = function() {
			var self = this;
			self.setActive(false);
		};

		this.initialize();
	};
	// Return a reference to the function
	return (LeftMenu);
});