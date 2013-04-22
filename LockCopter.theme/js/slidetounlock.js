
var TIME = 400;
var letters_interval;


iphone = {
	
	slide_started 		: false,
	
	letter_animate_time 	: 50,
	
	panels_animate_time	: 400,
	
	status 			: 'lock',	// lock, unlock, call, answer, off
	
	/* init iPhone functions */
	init : function(){

		iphone.slideInitiate();
/*
		iphone.prepareTextAnimate();
		
		iphone.startTextAnimate();
	*/			
		switch(iphone.status){
			case 'off':
				iphone.turnOff();
				break;

			case 'lock':
				iphone.lock();
				break;

			case 'unlock':
				iphone.unlock();
				break;
		}
	},


	slideInitiate : function(){
	
		if ( !this.is_mobile() ) {

			
			$('#iphone_slider').mousedown(function(e){
			
				e.preventDefault();
				
				var self = this;
				var element = $(this).offset();
				
				element.width = $(this).width();
				element.height = $(this).height();
				element.css_left = parseInt($(this).css('left')); 

				mouse_position = {
					x : e.pageX - element.left
				};
				
				slide_area_width = parseInt($('#iphone_unlock').width());
				slider_left = parseInt($('#iphone_slider').css('left'));

				$(document).mousemove(function(e){

					iphone.slide_started = true;
					var x = e.pageX - element.left;

					var properties = { left: element.css_left + x - mouse_position.x };
					
					properties.left = (properties.left > slide_area_width - element.width - 5) ? slide_area_width - element.width - 5 : properties.left;
					properties.left = (properties.left < slider_left) ? slider_left : properties.left;

					var opacity_k = (slide_area_width - properties.left*3) / (slide_area_width);
					$('#iphone_slide2unlock').css({'opacity': opacity_k}, TIME/2);

					$(self).css(properties);
					
				});
			});
			$(document).mouseup(function(){
				if(iphone.slide_started) {
					$(document).unbind('mousemove');
					iphone.endSlide();
					iphone.slide_started = false;
				}
			});
			
		} else {
			
			$('#iphone_slider').bind("touchstart", function(e){
			
				e.preventDefault();

				var orig = e.originalEvent;
				
				var self = this;
				var element = $(this).offset();
				
				element.width = $(this).width();
				element.height = $(this).height();
				element.css_left = parseInt($(this).css('left')); 

				mouse_position = {
					x : orig.changedTouches[0].pageX - element.left
				};
				
				slide_area_width = parseInt($('#iphone_unlock').width());
				slider_left = parseInt($('#iphone_slider').css('left'));

				$(document).bind("touchmove", function(e){

					var x = orig.changedTouches[0].pageX - element.left;

					var properties = { left: element.css_left + x - mouse_position.x };
					
					properties.left = (properties.left > slide_area_width - element.width - 5) ? slide_area_width - element.width - 5 : properties.left;
					properties.left = (properties.left < slider_left) ? slider_left : properties.left;

					var opacity_k = (slide_area_width - properties.left*3) / (slide_area_width);
					$('#iphone_slide2unlock').css({'opacity': opacity_k}, TIME/2);

					$(self).css(properties);
					
				});
			}).bind("touchend", function(){
				$(document).unbind('touchmove');
				iphone.endSlide();
			});
		}
	},


	/* function unlocks iPhone or back slider to start */
	endSlide : function(){
        var $iphone_unlock = $('#iphone_unlock');
        var $iphone_slider = $('#iphone_slider');
		var slider_left = parseInt($("#iphone_slider").css('left'));
		if ( slider_left > (parseInt($iphone_unlock.width()) - parseInt($iphone_slider.width()) - 20)) {
			iphone.unlock();
		} else {
			var time_k = slider_left / (parseInt($iphone_unlock.width()) - parseInt($iphone_slider.width()) - 20);
            $iphone_slider.animate({'left': '0'}, (TIME * time_k) * 2 / 3);
			$('#iphone_slide2unlock').stop().animate({'opacity': '1'}, (TIME * time_k) * 2 / 3);
		}
	},


	turnOn : function(){
		if (iphone.status != 'off') 
			return;
	
		iphone.status = 'lock';
		$('#iphone_slider').css({'left': '0'});
		$('#iphone_slide2unlock').css({'opacity': '1'});
	},

	lock : function(){
		iphone.status = 'lock';
		document.getElementById("splash").style.display = "";
		document.getElementById("container").style.display = "none";
		$('#iphone_slider').css({'left': '0'});
		$('#iphone_slide2unlock').css({'opacity': '1'});
	},

	unlock : function(){
		iphone.status = 'unlock';
		document.getElementById("splash").style.display = "none";
		document.getElementById("container").style.display = "";
		Copter.Start();
	},

	stopTextAnimate : function(){
		clearInterval(letters_interval);
	},
	
	
	startTextAnimate : function(){
		iphone.animateLetters();
	},
	
	
	prepareTextAnimate : function () {
        var slide2unlock = $('#iphone_slide2unlock');
		var start_text = slide2unlock.html();
		var end_text = '';
		for(var i = 0; i< start_text.length; i++){
			end_text += '<span style="opacity:0.3">' + start_text.charAt(i) + '</span>';
		}
        slide2unlock.html(end_text);
		
		var spans = slide2unlock.children('span');
		for (i = 0; i < spans.length; i++){
			$(spans[ i ]).attr('id', 'spans_'+i);
		}
	},
	
	
	animateLetters : function() {
		setTimeout(function(){
			iphone.animateCicle();
		}, iphone.pannels_animate_time);
		
		letters_interval = setInterval(function(){
			iphone.animateCicle();
		},2500);
	},


	animateCicle : function(){
		for (var i = 0; i < 15; ++i) {
			(function(i) {
				setTimeout(function(){
					$('#spans_'+i).stop().animate({'opacity':'1'}, iphone.letter_animate_time, function(){
						setTimeout(function(){ $('#spans_' + i).stop().animate({'opacity':'0.3'}, iphone.letter_animate_time) }, iphone.letter_animate_time*4);
					});
				}, (i * iphone.letter_animate_time*1.2));
			})(i);
		}
	},	
	
	is_mobile : function() {
		return navigator.userAgent.toString().toLowerCase().indexOf('chrome') == -1;
	}
};