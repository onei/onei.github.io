
(function () {

	'use strict';

	var ids = ['DP', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];

/**
 * Moves the segments one place to the right
 */
function moveSegmentsLeft() {}

/**
 * Moves the segments one place to the left
 */
function moveSegmentsRight() {}

/**
 * Prepends a new segment to the segment rail
 */
function prependSegment() {}

/**
 * Appends a new segment to the segment rail
 */
function appendSegment() {}

/**
 * Re-indexes all the segments following an addition
 */
function reIndex() {
	$segments = $('.segment-rail > .segment-display');

	$segments.each(function (index) {
		var $this = $(this),
			oldIndex = getSegIndex($this);
			newndex = 'index-' + index;

		if (oldIndex !== false) {
			oldIndex = 'index-' + oldIndex;
			$this.removeClass(oldIndex);
		}

		$this.addClass(newindex);
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
		index;

	re.match(segClass);

	// extract matching group
	// ...
	// else return false;

	// convert to number
	index *= 1;

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

function updateConfig() {}

	function init() {
		$('.segment-7 .seg').click(function () {;
			var $this = $(this);

			console.log('click', $this, $this.hasClass('on'));

			if (svgHasClass($this, 'on')) {
				console.log('remove');
				svgRemoveClass($this, 'on');
			} else {
				console.log('add');
				svgAddClass($this, 'on');
			}
		});

		// @todo add click handlers to chevrons too
	}

	$(init);

}());
