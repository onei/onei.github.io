
// @todo disable chevrons during transition

(function ($) {

	'use strict';

	var ids = ['DP', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];

	/**
	 * Moves the segments one place to the right
	 */
	function moveSegmentsLeft() {
		var $segments = $('.segment-rail > .segment-display'),
			$view,
			i,
			viewClass,
			$chevron;

		$chevron = $('.segment-overlay-left .chevron');

		if ($chevron.hasClass('disabled')) {
			console.log('dsiabled');
			return;
		}

		$chevron.addClass('disabled');

		setTimeout(function () {
			$chevron.removeClass('disabled');
		// use just over half a second (the transition time)
		}, 550);

		$segments.each(function () {
			var $this = $(this),
				transform = $this.css('transform'),
				re = /matrix\(\s*-?\d+,\s*-?\d+,\s*-?\d+,\s*-?\d+,\s*(-?\d+),\s*(-?\d+)\s*\)/,
				matches = transform.match(re),
				css,
				x,
				y;

			if (matches === null) {
				// sometimes happens when the cehvrons are clicked too quickly
				// except it's the opposite direction the the chevron that's has the error
				// in this case right
				return;
			}

			x = matches[1] * 1;
			y = matches[2];

			x -= 134;
			x += 'px';
			y += 'px';

			css = 'translate(' + x + ', ' + y + ')';
			$this.css('transform', css);
		});

		$view = $segments.filter('.view-0').next();

		for (i = 0; i < 4; i++) {
			viewClass = 'view-' + i;

			// remove the class from the old view element
			$segments.removeClass(viewClass);
			// add it to the new one
			$view.addClass(viewClass);
			// and move to the next viewed element
			$view = $view.next();
		}

		appendSegment();
		updateInputs();
	}

	/**
	 * Moves the segments one place to the left
	 */
	function moveSegmentsRight() {
		var $segments = $('.segment-rail > .segment-display'),
			$view,
			i,
			viewClass,
			$chevron;

		$chevron = $('.segment-overlay-right .chevron');

		if ($chevron.hasClass('disabled')) {
			console.log('dsiabled');
			return;
		}

		$chevron.addClass('disabled');

		setTimeout(function () {
			$chevron.removeClass('disabled');
		// use just over half a second (the transition time)
		}, 550);

		// move each segment 1 place right
		$segments.each(function () {
			var $this = $(this),
				transform = $this.css('transform'),
				re = /matrix\(\s*-?\d+,\s*-?\d+,\s*-?\d+,\s*-?\d+,\s*(-?\d+),\s*(-?\d+)\s*\)/,
				matches = transform.match(re),
				css,
				x,
				y;

			if (matches === null) {
				// sometimes happens when the cehvrons are clicked too quickly
				// except it's the opposite direction the the chevron that's has the error
				// in this case left
				return;
			}

			x = matches[1] * 1;
			y = matches[2];

			// @todo define this dynamically (mobile)
			x += 134;
			x += 'px';
			y += 'px';

			css = 'translate(' + x + ', ' + y + ')';
			$this.css('transform', css);
		});

		$view = $segments.filter('.view-0').prev();

		for (i = 0; i < 4; i++) {
			viewClass = 'view-' + i;

			// remove the class from the old view element
			$segments.removeClass(viewClass);
			// add it to the new one
			$view.addClass(viewClass);
			// and move to the next viewed element
			$view = $view.next();
		}

		prependSegment();
		updateInputs();
	}

	/**
	 * Prepends a new segment to the segment rail
	 */
	function prependSegment() {
		var $rail = $('.segment-rail'),
			$view = $rail.find('.view-0'),
			index = getSegIndex($view),
			$clone;

		if (index >= 2) {
			return;
		}

		// clone events
		$clone = $view.clone(true);
		$clone.removeClass('view-0');
		$clone.css('transform', 'translate(-44px, 5px)');
		$rail.prepend($clone);

		reIndex();
	}

	/**
	 * Appends a new segment to the segment rail
	 */
	function appendSegment() {
		var $rail = $('.segment-rail'),
			$view = $rail.find('.view-3'),
			index = getSegIndex($view),
			$clone;

		if ((index + 3) <= $rail.find('.segment-display').length) {
			return;
		}

		// clone events
		$clone = $view.clone(true);
		$clone.removeClass('view-3');
		$clone.css('transform', 'translate(894px, 5px)');
		$rail.append($clone);

		reIndex();
	}

	/**
	 * Re-indexes all the segments following a asegment being appended or prepended to the rail
	 */
	function reIndex() {
		var $segments = $('.segment-rail > .segment-display');

		$segments.each(function (index) {
			var $this = $(this),
				oldIndex = getSegIndex($this),
				newIndex = 'index-' + index;

			if (oldIndex !== false) {
				oldIndex = 'index-' + oldIndex;
				$this.removeClass(oldIndex);
			}

			$this.addClass(newIndex);
		});
	}

	function updateInputs() {}

	/**
	 * Gets the segment's index number for comparison
	 */
	function getSegIndex($segment) {
			// use native js thing for this
		var segClass = ' ' + $segment.attr('class') + ' ',
			re = /\sindex-(\d+)\s/,
			index,
			matches;

		matches = segClass.match(re);

		if (matches === null) {
			return false;
		}

		index = matches[1] * 1;
		return index;
	}

	function getSegConfig($segment) {
		var $segs = $segment.find('.seg'),
			config = {},
			binary = '';

		ids.forEach(function (elem) {
			var segClass = '.seg-' + elem,
				$seg = $segs.filter(segClass).first(),
				hasClass = $seg.hasClass('on');

			config[elem] = (hasClass ? true : false);
			binary += (hasClass ? '1' : '0');
		});

		config.binary = binary;

		// first, convert `binary` valid binary string
		// then convert it number (decimal)
		// finally convert to hexidecimal (base 16)
		config.hex = (('0b' + binary) * 1).toString(16);

		return config;
	}

	/**
	 * Adds support for removing classes from elements in svg
	 */
	function svgRemoveClass($elem, toRemove) {
		var classes = $elem.attr('class').split(/\s+/),
			index = classes.indexOf(toRemove);

		if (index > -1) {
			classes.splice(index, 1);
		}

		classes = classes.join(' ');
		$elem.attr('class', classes);
	}

	/**
	 * Adds support for adding classes to elements in svg
	 */
	function svgAddClass($elem, toAdd) {
		var classes = $elem.attr('class');

		classes += ' ' + toAdd;
		$elem.attr('class', classes);
	}

	/**
	 * Adds support for checking if an svg element has a specified class
	 */
	function svgHasClass($elem, toCheck) {
		var classes = $elem.attr('class').split(/\s+/);

		if (classes.indexOf(toCheck) > -1) {
			return true;
		}

		return false;
	}

	function segHighlight() {
		var $this = $(this),
			func = svgHasClass($this, 'on') ?
				svgRemoveClass :
				svgAddClass;

		func($this, 'on');
	}

	function init() {
		// segment click handlers
		$('.segment-7 .seg').click(segHighlight);

		// chevron click handlers
		$('.segment-overlay-left .chevron').click(moveSegmentsLeft);
		$('.segment-overlay-right .chevron').click(moveSegmentsRight);
	}

	$(init);

}(jQuery));
