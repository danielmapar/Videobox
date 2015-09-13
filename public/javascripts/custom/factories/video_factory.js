app.factory("Video", function() {

	var Video = function(video, location) {

		this.clone = function(video) {
			var self = this;
			self.name = video.name;
			self.src = video.src;
			self.thumbnail = video.thumbnail;
			self.site = video.site;
		};

		this.setMouseOver = function(active) {
			var self = this;
			if (self.from === 'container') {
				self.mouseOver = {container: active};
			}
		};

		this.setMouseOverGap = function(active) {
			var self = this;
			if (self.from === 'box') {
				self.mouseOverGap = {box: active};
			}
		};

		this.setFrom = function(location) {
			var self = this;
			self.from = location;
		};

		this.setBeingDragged = function(active) {
			var self = this;
			self.beingDragged = active;
		};

		this.initialize = function() {
			var self = this;

			self.clone(video);
			self.setFrom(location);
			self.setBeingDragged(false);
			self.setMouseOver(false);
		};

		this.initialize();
	};
	// Return a reference to the function
	return (Video);
});