//
//
// NicoHTML5.VideoPlayer
//
//

NicoHTML5.VideoPlayer = function() {
    this.initialize.apply(this, arguments);
};

NicoHTML5.VideoPlayer.prototype = {

    initialize: function(target, options) {
	this.target = target;
	this.options = {
	    width: 512,
	    height: 384,
	    onLoadStart: null,
	    onFailed: null,
	    onPlay: null,
	    onSeek: null,
	    onPause: null,
	    onEnded: null
	};

	if(options != undefined) {
	    for(var key in options)
		this.options[key] = options[key];
	}

	this.playTimer = null;
	this.loop = false;
	this.createPlayer();
    },

    createPlayer: function() {
	var self = this;
	
	var vc = document.createElement("div");
	vc.className = "videoplayer_video_container";
	this.videoContainer = vc;
	
	var v = undefined;

	v = document.createElement("video");
	v.className = "videoplayer_video";
	v.width = this.options.width;
	v.height = this.options.height;
	v.autoplay = false;
	v.controls = false;
	
	v.addEventListener("error",          function() { self.onError(); });
	v.addEventListener("progress",       function() { self.onProgress(); });
	v.addEventListener("loadedmetadata", function() { self.onLoadedMetaData(); });
	v.addEventListener("loadeddata",     function() { self.onLoadedData(); });
	v.addEventListener("canplay",        function() { self.onCanPlay(); });
	v.addEventListener("play",           function() { self.onPlay(); });
	v.addEventListener("playing",        function() { self.onPlaying(); });
	v.addEventListener("seek",           function() { self.onSeek(); });
	v.addEventListener("pause",          function() { self.onPause(); });
	v.addEventListener("ended",          function() { self.onEnded(); });
	//v.addEventListener("loadstart", function(e) { self.onEvent(e); });
	//v.addEventListener("abort",     function(e) { self.onEvent(e); });
	//v.addEventListener("error",     function(e) { self.onEvent(e); });
	//v.addEventListener("emptied",   function(e) { self.onEvent(e); });
	//v.addEventListener("volumechange",   function() { self.onVolumeChange(); });
	
	vc.appendChild(v);
	this.video = v;

	var cc = document.createElement("div");
	cc.className = "videoplayer_controls_container";

	var pb = document.createElement("div");
	pb.className = "videoplayer_play_button";
	pb.innerHTML = "&nbsp;&nbsp;&nbsp;&#x25B6;&#x2590;";
	pb.addEventListener("mousedown", function() { self.pressPlayButton(); });

	var bb = document.createElement("div");
	bb.className = "videoplayer_back_button";
	bb.innerHTML = "&#x2590;&#x25C0;&nbsp;";
	bb.addEventListener("mousedown", function() { self.pressBackButton(); });	

	var sb = document.createElement("div");
	this.seekbar = new NicoHTML5.Seekbar(sb, function(p) { self.onSeek(p); });
	
	var tb = document.createElement("div");
	tb.className = "videoplayer_time";
	this.timeElm = tb;

	var vbc = document.createElement("div");
	vbc.className = "videoplayer_volumebar";

	var vb = document.createElement("div");
	this.volumebar = new NicoHTML5.Seekbar(vb, function(p) { self.onVolumeChange(p); } );
	this.volumebar.setDuration(1.0);
	this.volumebar.setBuffered(1.0);
	vbc.appendChild(vb);

	var lb = document.createElement("div");
	lb.className = "videoplayer_loop_button";
	lb.innerHTML = "&#x21A9;";
	lb.addEventListener("mousedown", function(e) { self.pressLoopButton(e); });
	
	var fb = document.createElement("div");
	fb.className = "videoplayer_fullscreen_button";
	fb.innerHTML = "&#x2197;";
	fb.addEventListener("mousedown", function() { self.pressFullscreenButton(); });

	cc.appendChild(pb);
	cc.appendChild(bb);
	cc.appendChild(sb);
	cc.appendChild(tb);
	cc.appendChild(vbc);
	cc.appendChild(lb);
	//cc.appendChild(fb);

	this.target.appendChild(vc);
	this.target.appendChild(cc);	
    },

    getCurrentTime: function() {
	return this.video.currentTime;
    },

    pressPlayButton: function() {
	if(this.video.paused)
	    this.play();
	else
	    this.pause();
    },

    pressBackButton: function() {
	if(this.video.currentTime > 0.0) {
	    this.onSeek(0.0);
	}
    },

    pressLoopButton: function(e) {
	if(this.loop) {
	    this.loop = false;
	    e.target.className = "videoplayer_loop_button";
	} else {
	    this.loop = true;
	    e.target.className = "videoplayer_loop_button videoplayer_button_active";
	}
    },

    pressReloadButton: function() {
	if(this.video.currentTime > 0.0) {
	    this.onSeek(0.0);
	}
	this.reload();
    },

    play: function() {
	if(this.video.currentSrc == undefined || this.video.currentSrc == "")
	    return;
	if(this.video.readyState <= 1) // HAVE_METADATA = 1
	    return;

	this.video.play();
    },

    pause: function() {
	this.video.pause();
    },

    load: function(src, type) {
	this.video.src = src;

	if(type)
	    this.video.type = type;

	this.video.load();

	if(this.loadTimer) {
	    clearInterval(this.loadTimer);
	    this.laodTimer = null;
	}
    },

    reload: function() {
	if(this.video.src) {
	    var src = this.video.src;
	    var type = this.video.type;
	    this.load(src, type);	    
	}
    },

    onEvent: function(e) {
	alert(e.type);
    },

    onProgress: function() {
    },

    onLoadedMetaData: function() {
	this.seekbar.setDuration(this.video.duration);
	this.volumebar.setPosition(this.video.volume);
	this.onUpdate();
	
	var self = this;
	if(this.loadTimer == null)
	    this.loadTimer = setInterval(function() { self.onLoadedData(); }, 500);
    },

    onLoadedData: function() {
	if(this.video.buffered.length > 0) {
	    var b = this.video.buffered.end(0);
	    this.seekbar.setBuffered(b);
	}
    },

    onCanPlay: function() {
	if(this.autoplay)
	    this.play();
    },

    onPlay: function() {
    },

    onUpdate: function() {
	this.timeElm.innerHTML = NicoHTML5.sec2MinSec(this.video.currentTime) + 
                                 " / " + 
                                 NicoHTML5.sec2MinSec(this.video.duration);
	this.seekbar.setPosition(this.video.currentTime, false);
    },

    onPlaying: function() {
	var self = this;
	if(this.playTimer == null)
	    this.playTimer = setInterval(function() { self.onUpdate(); }, 100);

	if(this.options.onPlay)
	    this.options.onPlay();
    },

    onPause: function() {
	if(this.playTimer)
	    clearInterval(this.playTimer);
	this.playTimer = null;

	if(this.options.onPause)
	    this.options.onPause();
    },

    onEnded: function() {
	if(this.loop) {
	    this.onSeek(0);
	} else {
	    if(this.options.onEnded)
		this.options.onEnded();
	}
    },

    onSeek: function(seekTime) {
	this.video.currentTime = seekTime;	
	this.onUpdate();

	if(this.options.onSeek)
	    this.options.onSeek(seekTime);
    },

    onVolumeChange: function(volume) {
	this.video.volume = volume;
    },

    onError: function() {
	var  msg = "";
	switch(this.video.error.code) {
	case MediaError.MEDIA_ERR_ABORTED:
	    msg = "process was aborted"; break;
	case MediaError.MEDIA_ERR_NETWORK:
	    msg = "network error"; break;
	case MediaError.MEDIA_ERR_DECODE:
	    msg = "decode error"; break;
	case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
	    msg = "source not supported"; break;
	default:
	    msg = "unknown error"; break;
	}

	if(this.options.onFailed)
	    this.options.onFailed(this.video.error.code, msg);
    }    
};

