app.factory("Container", ['$http', '$sce', 'Video', function($http, $sce, Video) {

	var Container = function() {

		// Return most famous videos of the day
		this.getTopDailyVideos = function() {
			var self = this;
			return $http.get('/video/dailyTop').success(function(videos){
				for(var i = 0; i < videos.length; i++) {
					videos[i].src = $sce.trustAsResourceUrl(videos[i].src);
					self.pushVideo(videos[i]);
				}
			});
		};

		this.pushVideo = function(video) {
			var self = this;
			self.videos.push(new Video(video, 'container'));
		};

		this.setVideos = function(videos) {
			var self = this;
			self.videos = videos;
		};

		this.setMouseOver = function(video) {
			var self = this;
			for(var i = 0; i < self.videos.length; i++) {
				if (self.videos[i] === video) {
					self.videos[i].setMouseOver(true);
				} else {
					self.videos[i].setMouseOver(false);
				}
			}
		};

		this.clearMouseOver = function() {
			var self = this;
			for(var i = 0; i < self.videos.length; i++) {
				self.videos[i].setMouseOver(false);
			}
		};

		this.clearBeingDragged = function() {
			var self = this;
			for(var i = 0; i < self.videos.length; i++) {
				self.videos[i].setBeingDragged(false);
			}
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
		};

		this.initialize();
	};
	// Return a reference to the function
	return (Container);
}]);