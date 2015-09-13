app.factory("Box", ['$http', 'auth', 'Video', function($http, auth, Video) {

	var Box = function() {

		this.setId = function(_id) {
			var self = this;
			self._id = _id;
		};

		this.setName = function(name) {
			var self = this;
			self.name = name;
		};

		this.setTags = function(tags) {
			var self = this;
			self.tags = tags;
		};

		this.setSaved = function(saved) {
			var self = this;
			self.saved = saved;
		};

		this.create = function(box) {
			var self = this;
			self.setName(box.name);
			self.setTags(box.tags); 

			if (auth.isLoggedIn()) {
				return $http.post('/box/create', box, auth.getAuthorizationHeader()).success(function(box){
					self.setId(box._id);
				});
			}
		};

		this.save = function() {
			var self = this;

			var videos = [];
			for(var i = 0; i < self.videos.length; i++) {
				videos.push({
					name:      self.videos[i].name,
					url:       self.videos[i].src.$$unwrapTrustedValue(),
					thumbnail: self.videos[i].thumbnail,
					site:      self.videos[i].site
				});
			}

			if (auth.isLoggedIn() && self._id) {
				return $http.post('/box/save', {boxId: self._id, videos: videos}, auth.getAuthorizationHeader()).success(function() {
					self.setSaved(true);
				}).error(function () {
					self.setSaved(false);
				});
			}
		};

		this.saveUnauthenticated = function() {
			var self = this;

			var videos = [];
			for(var i = 0; i < self.videos.length; i++) {
				videos.push({
					name:      self.videos[i].name,
					url:       self.videos[i].src.$$unwrapTrustedValue(),
					thumbnail: self.videos[i].thumbnail,
					site:      self.videos[i].site
				});
			}

			if (!auth.isLoggedIn() && !self.saved) {
				console.log({name: self.name, tags: self.tags, videos: videos});
				return $http.post('/box/createUnauthenticated', {name: self.name, tags: self.tags, videos: videos}).success(function(box){
					self.setId(box._id);
					self.setSaved(true);
				}).error(function () {
					self.setSaved(false);
				});
			}
		};

		this.size = function() {
			var self = this;
			return self.videos.length;
		};

		this.pushVideo = function(video) {
			var self = this;
			self.videos.push(new Video(video, 'box'));
			self.save();
		};

		this.pushVideoToGap = function(video) {
			var self = this;
			// Include video in the middle of the list
			for (var i = 0; i < self.videos.length; i++) {
				if (self.videos[i].mouseOverGap && self.videos[i].mouseOverGap.box === true) {
					self.videos.splice(i, 0, new Video(video, 'box'));
					self.save();
					return true;
				}
			}
			return false;
		};

		this.removeVideoBeingDragged = function() {
			var self = this;
			// Delete video being dragged
			for (var i = 0; i < self.videos.length; i++) {
				if (self.videos[i].beingDragged === true) {
					self.videos.splice(i, 1);
					break;
				}
			}
		};

		this.removeVideo = function(videoIndex) {
			var self = this;
			self.videos.splice(videoIndex, 1);
		};

		this.setVideoOver = function(active) {
			var self = this;
			self.videoOver = active;
		};

		this.setVideoOverGap = function(active, video) {
			var self = this;
			if (active && video) {
				self.videoOverGap = active;
				video.setMouseOverGap(true);
			} else {
				self.videoOverGap = active;
				for (var i = 0; i < self.videos.length; i++) {
					self.videos[i].setMouseOverGap(false);
				}
			}
		};

		this.isVideoBeingDraggedLastOne = function() {
			var self = this;
			// Delete video being dragged
			for (var i = 0; i < self.videos.length; i++) {
				if (self.videos[i].beingDragged === true) {
					return ((self.videos.length-1) === i);
				}
			}
			return false;
		};

		this.clearBeingDragged = function() {
			var self = this;
			for(var i = 0; i < self.videos.length; i++) {
				self.videos[i].setBeingDragged(false);
			}
		};

		this.setVideos = function(videos) {
			var self = this;
			self.videos = videos;
		};

		this.setEnable = function(active) {
			var self = this;
			self.enable = active;
		};

		this.setLimitToScroll = function(limit) {
			var self = this;
			this.limitToScroll = limit;
		};

		this.scrollToTheRight = function() {
			$(".box-videos").scrollLeft($(".box-videos").width());
		};

		this.print = function() {
			var self = this;
			for(var i = 0; i < self.videos.length; i++) {
				console.log(self.videos[i]);
			}
		};

		this.initialize = function() {
			var self = this;
			self.setVideos([]);
			self.setEnable(true);
			self.setLimitToScroll(9);
		};

		this.initialize();
	};
	// Return a reference to the function
	return (Box);
}]);