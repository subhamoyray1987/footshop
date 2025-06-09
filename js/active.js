(function ($) {
	"use strict";

	// Sticky menu 
	var $window = $(window);
	$window.on('scroll', function () {
		var scroll = $window.scrollTop();
		if (scroll < 100) {
			$(".sticky").removeClass("is-sticky");
		} else {
			$(".sticky").addClass("is-sticky");
		}
	});

	// Background Image JS start
	var bgSelector = $(".bg-img");
	bgSelector.each(function (index, elem) {
		var element = $(elem),
			bgSource = element.data('bg');
		element.css('background-image', 'url(' + bgSource + ')');
	});

	

	// tooltip active js
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))


	// Hero main slider active
	$('.hero-slider-active').slick({
		fade: true,
		autoplay: true,
		speed: 1000,
		prevArrow: '<button type="button" class="slick-prev"><i class="fa fa-angle-left"></i></button>',
		nextArrow: '<button type="button" class="slick-next"><i class="fa fa-angle-right"></i></button>',
		responsive: [{
			breakpoint: 992,
			settings: {
				arrows: false,
				dots: true
			}
		},
		{
			breakpoint: 480,
			settings: {
				arrows: false,
				dots: false
			}
		}]
	});


	// testimonial carousel active js
	$('.testimonial_holder').slick({
		slidesToShow: 2,
		slidesToScroll: 2,
		dots: true,
		arrows: false,
		responsive: [
			{
				breakpoint: 767,
				settings: {
					dots: false,
					slidesToShow: 1,
					slidesToScroll: 1,
				}
			}
		]
	});


	// scroll to top
	$(window).on('scroll', function () {
		if ($(this).scrollTop() > 600) {
			$('.scroll-top').removeClass('not-visible');
		} else {
			$('.scroll-top').addClass('not-visible');
		}
	});
	$('.scroll-top').on('click', function (event) {
		$('html,body').animate({
			scrollTop: 0
		}, 1000);
	});


}(jQuery));