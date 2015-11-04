
// @todo add support for reversing order of segments in .letters to options
// swipe events for mobile support
// <http://www.javascriptkit.com/javatutors/touchevents2.shtml>

// @todo add support for predefined patterns via hex values in url
//       value=$hex animate=(1/0) activelow=(1/0) startwith=(DP/A) (startswith_)
//       @todo find word for DP->A order

(function ($) {

	'use strict';

		/**
		 * Boolean to prevent multiple movements being fired until the previous movement has completed.
		 */
	var disabled = false,

		/**
		 * replacement for x*
		 * @todo document
		 */
		x = {
			/**
			 * The width of an SVG segment plus the separating margin in pixels
			 * Used to calculate where to position segments to after movements and during initial positioning
			 *
			 * Dynamically calculated based on available screen width
			 */
			offset: null,

			/**
			 * The start of the view area of the rail in pixels
			 * Used to calculate where to position segments during initial positioning
			 *
			 * Dynamically calculated based on available screen width
			 */
			start: null,

			/**
			 *
			 */
			first: null,

			/**
			 *
			 */
			last: null
		},

		settings = {
			/**
			 * Whether the display is active low (if the segment's bit is set to 1 it's off)
			 * or active high (vice versa)
			 */
			activeLow: false,

			/**
			 * 1 is DP->A, 0 is A->DP
			 */
			order: 1,
		},

		/**
		 * @todo
		 */
		maxElements = 4,

		/**
		 * @todo
		 */
		init = {
			/**
			 * @todo
			 */
			main: function () {
				// calculate `x.offset` and `x.start`
				init.setDimensions();

				// set initial segment positions
				init.setupSegments();

				// set initial highlight colour
				init.setColour();

				// enforce values in `settings`
				init.enforceSettings();

				// segment click handlers
				$('#segRail .seg').click(segments.highlight);

				// chevron click handlers
				$('#chevronLeft').click(segments.moveLeft);
				$('#chevronRight').click(segments.moveRight);

				// colour pick click handlers
				$('#optionsColours .pick').click(options.colourPick);

				// letters click handlers
				$('#inputsLetters .letter').click(inputs.highlightLetter);

			},

			/**
			 * Sets `x.start` and `x.offset` which are used for positioning each segment
			 * These are set dynamically to allow for greater flexibility with variable screen width
			 */
			setDimensions: function () {
				var maxWidth = $('#article').width(),
					// just check the left one, as they're both the same
					overlayWidth = $('#segOverlayLeft').width(),
					segmentWidth = $('#segRail .seg-display').width(),
					separatorWidth = (maxWidth - (2 * overlayWidth) - (segmentWidth * 4)) / 3;

				x.offset = segmentWidth + separatorWidth;
				x.start = overlayWidth;

				console.log('xstart, xOffset:', x.start, x.offset);
			},

			/**
			 * Set initial positioning for each segment and adds data-view attributes to the editable segments
			 */
			setupSegments: function () {
				var $segs = $('#segRail .seg-display');

				$segs.each(function (index) {
					var $this = $(this),
						viewIndex = index - 2,
						xPosition = x.start + (viewIndex * x.offset),
						// @todo use some sort of string format method?
						css = 'translateX(' + xPosition + 'px)';

					$this.css('transform', css);

					if (viewIndex >= 0 && viewIndex < 4) {
						$this.attr('data-view', viewIndex);
					}

					if (index === 0) {
						x.first = xPosition;
					} else if (index === 7) {
						x.last = xPosition;
					}
				});
			},

			/**
			 * Sets green as the initial highlight colour
			 */
			setColour: function () {
				$('#coloursPickGreen').addClass('selected');
				$('#segRail, #inputsLetters').addClass('green');
			},

			/**
			 *
			 */
			enforceSettings: function () {
				var $letters = $('#inputsLetters .view');

				// enforce order of segments
				// matters when calculating binary and hex values
				if (settings.order === 0) {
					$letters.each(function () {
						// <http://stackoverflow.com/a/5347903/1942596>
						var $this = $(this),
							$letters = $this.children();

						$this.append($letters.get().reverse());
					});
				}

				// delegate binary hex conversion to the normal function
				inputs.updateBinaryHex();
			}
		},

		segments = {
			/**
			 * Moves the segments one place left on the rail.
			 */
			moveLeft: function () {
				// don't allow more than one movement to be submitted at a time
				if (disabled) {
					return;
				}

				disabled = true;

				// allow another movement when the animation has completed (500ms)
				// plus a bit more because it caused an odd positioning bug
				// where if a click was timed right it could cause two segments to end up
				// on top of each other
				setTimeout(function () {
					disabled = false;
				}, 550);

				var $segs = $('#segRail .seg-display'),
					re = /matrix\(\s*-?\d+,\s*-?\d+,\s*-?\d+,\s*-?\d+,\s*(-?\d+),\s*(-?\d+)\s*\)/,
					viewFirst;

				$segs.each(function () {
					var $this = $(this),
						transform = $this.css('transform'),
						matches = transform.match(re),
						xPosition,
						css;

					if (matches === null) {
						console.log('Error: No matches found.');
						return;
					}

					xPosition = matches[1] * 1;
					xPosition -= x.offset;

					css = 'translateX(' + xPosition + 'px)';
					$this.css('transform', css);
				});

				// get the index of the previous first item in the view
				viewFirst = $segs.filter('[data-view="0"]').attr('data-index');
				// convert to number and move it forward one
				viewFirst = (viewFirst * 1) + 1;

				segments.reView(viewFirst);
				segments.append();
				inputs.rebuildHighlights(viewFirst);
			},

			/**
			 * Moves the segments one place right on the rail.
			 */
			moveRight: function () {
				// don't allow more than one movement to be submitted at a time
				if (disabled) {
					return;
				}

				disabled = true;

				// allow another movement when the animation has completed (500ms)
				// plus a bit more because it caused an odd positioning bug
				// where if a click was timed right it could cause two segments to end up
				// on top of each other
				setTimeout(function () {
					disabled = false;
				}, 550);

				var $segs = $('#segRail .seg-display'),
					re = /matrix\(\s*-?\d+,\s*-?\d+,\s*-?\d+,\s*-?\d+,\s*(-?\d+),\s*(-?\d+)\s*\)/,
					viewFirst;

				$segs.each(function () {
					var $this = $(this),
						transform = $this.css('transform'),
						matches = transform.match(re),
						xPosition,
						css;

					if (matches === null) {
						console.log('Error: No matches found.');
						return;
					}

					xPosition = matches[1] * 1;
					xPosition += x.offset;

					css = 'translateX(' + xPosition + 'px)';
					$this.css('transform', css);
				});

				// get the index of the previous first item in the view
				viewFirst = $segs.filter('[data-view="0"]').attr('data-index');
				// convert to number and move it forward one
				viewFirst = (viewFirst * 1) - 1;

				console.log(viewFirst);

				segments.reView(viewFirst);
				segments.prepend();

				// fix for when prepending an element causes the indexing to be incorrect
				if ($segs.length < $('#segRail .seg-display').length) {
					console.log('extra element detected');
					viewFirst += 1
				}

				inputs.rebuildHighlights(viewFirst);
			},

			/**
			 * Appends a segment to the rail.
			 */
			append: function () {
				var $rail = $('#segRail'),
					$segs = $rail.find('.seg-display'),
					$lastViewSeg = $segs.filter('[data-view="3"]'),
					index = $lastViewSeg.attr('data-index') * 1,
					$clone,
					css;

				// make sure there's a minimum of 2 after the view area
				if (index + 2 >= $segs.length) {
					// clone click handlers on the svg paths
					$clone = $lastViewSeg.clone(true);

					css = 'translateX(' + x.last + 'px)';
					$clone.css('transform', css);

					$clone.removeAttr('data-view');

					$rail.append($clone);
					segments.reIndex();
				}
			},

			/**
			 * Prepends a segment to the rail.
			 */
			prepend: function () {
				var $rail = $('#segRail'),
					$firstViewSeg = $rail.find('.seg-display[data-view="0"]'),
					index = $firstViewSeg.attr('data-index') * 1,
					$clone,
					css;

				// make sure there's a minimum of 2 before the view area
				if (index - 2 < 0) {
					// clone click handlers on the svg paths
					$clone = $firstViewSeg.clone(true);

					css = 'translateX(' + x.first + 'px)';
					$clone.css('transform', css);

					$clone.removeAttr('data-view');

					$rail.prepend($clone);
					segments.reIndex();
				}
			},

			/**
			 * Re-indexes each segment following a segment being added.
			 */
			reIndex: function () {
				var $segs = $('#segRail .seg-display');

				$segs.removeAttr('data-index');

				$segs.each(function (index) {
					$(this).attr('data-index', index);
				});
			},

			/**
			 * Re-calculate view indexes.
			 */
			reView: function (index) {
				var $segs = $('#segRail .seg-display'),
					$oldView,
					i;

				$segs.removeAttr('data-view');

				$segs.slice(index, index + 4).each(function (i) {
					$(this).attr('data-view', i);
				});
			},


			/**
			 * Adds or removes a segment's highlight.
			 */
			highlight: function () {
				var $this = $(this),
					$view = $this.parents('.seg-display'),
					letter = $this.attr('data-segment'),
					viewIndex = $view.attr('data-view'),
					$letter = $('#inputsLetters .view')
						// filter to the group of letters associated with the correct view index
						.filter('[data-view="' + viewIndex + '"]')
						.find('.letter')
						// filter to the correct letter
						.filter('[data-letter="' + letter + '"]');

				if (svg.hasClass($this, 'on')) {
					svg.removeClass($this, 'on');
					$letter.removeClass('on');
				} else {
					svg.addClass($this, 'on');
					$letter.addClass('on');
				}

				inputs.updateBinaryHex();
			}
		},

		/**
		 * Methods relting to the options section
		 */
		options = {
			/**
			 * Click handler for colour picker
			 */
			colourPick: function () {
				var $this = $(this),
					$old = $('#optionsColours .selected'),
					$update = $('#segRail, #inputsLetters'),
					newClass = $this.attr('data-colour'),
					oldClass = $old.attr('data-colour');

				// move selected class
				$old.removeClass('selected');
				$this.addClass('selected');

				// swap class on rail and letters
				$update.removeClass(oldClass).addClass(newClass);
			}
		},

		/**
		 * Methods relating to the inputs section
		 */
		inputs = {
			/**
			 * Add or remove a highlight to a letter.
			 */
			highlightLetter: function () {
				var $this = $(this),
					$view = $this.parent('.view'),
					letter = $this.attr('data-letter'),
					viewIndex = $view.attr('data-view'),
					$segment = $('#segRail .seg-display')
						.filter('[data-view="' + viewIndex + '"]')
						.find('.seg')
						.filter('[data-segment="' + letter + '"]');

				if ($this.hasClass('on')) {
					$this.removeClass('on');
					svg.removeClass($segment, 'on');
				} else {
					$this.addClass('on');
					svg.addClass($segment, 'on');
				}

				inputs.updateBinaryHex();
			},

			/**
			 * Rebuild the highlighting for letters (and inputs?) after the segments are moved on the rail.
			 */
			rebuildHighlights: function (index) {
				var ids = ['DP', 'G', 'F', 'E', 'D', 'C', 'B', 'A'],
					$letters = $('#inputsLetters .view'),
					$segs = $('#segRail .seg-display').slice(index, index + 4);

				console.log($segs.get());
				console.log($segs.get(0));

				$segs.each(function (i) {
					var $seg = $(this),
						$letter = $letters.eq(i).find('.letter');

					// start with a clean slate
					$letter.removeClass('on');

					ids.forEach(function (id) {
						var $path = $seg.find('[data-segment="' + id + '"]');

						if (svg.hasClass($path, 'on')) {
							$letter.filter('[data-letter="' + id + '"]').addClass('on');
						}
					});
				});

				inputs.updateBinaryHex();
			},

			/**
			 * Updates binary and hex outputs
			 */
			updateBinaryHex: function () {
				var $letters = $('#inputsLetters .view'),
					$bins = $('#inputsBinary .view'),
					$hexs = $('#inputsHex .view');

				$letters.each(function (i) {
					var $this = $(this),
						$bin = $bins.eq(i),
						$hex = $hexs.eq(i),
						binStr = '0b',
						hexStr = '0x';

					$this.find('.letter').each(function () {
						if ($(this).hasClass('on')) {
							binStr += (settings.activeLow ? '0' : '1');
						} else {
							binStr += (settings.activeLow ? '1' : '0');
						}
					});

					

					hexStr += ('00' + (binStr * 1).toString(16)).slice(-2);

					console.log(binStr);
					console.log(hexStr);

					$bin.text(binStr);
					$hex.text(hexStr);
				});
			}
		},

		/**
		 * Methods for manipulating SVG class attributes
		 */
		svg = {
			/**
			 * Add a class to an SVG element.
			 *
			 * @param $elem {jQuery.object}
			 * @param toAdd {String}
			 */
			addClass: function ($elem, toAdd) {
				// don't duplicate classes
				if (svg.hasClass($elem, toAdd)) {
					return;
				}

				var classes = $elem.attr('class');
				classes += ' ' + toAdd;
				$elem.attr('class', classes);
			},

			/**
			 * Remove a class from a SVG element.
			 *
			 * @param $elem {jQuery.object}
			 * @param toAdd {String}
			 */
			removeClass: function ($elem, toRemove) {
				toRemove = toRemove.trim();

				var classes = $elem.attr('class').split(/\s/),
					index = classes.indexOf(toRemove);

				if (index > -1) {
					classes.splice(index, 1);
					classes = classes.join(' ');
					$elem.attr('class', classes);

				}
			},

			/**
			 * Test if an SVG element has a specified class.
			 *
			 * @param $elem {jQuery.object}
			 * @param toAdd {String}
			 *
			 * @returns {Boolean}
			 */
			hasClass: function ($elem, toCheck) {
				var classes = $elem.attr('class');

				classes = ' ' + classes + ' ';
				toCheck = ' ' + toCheck + ' ';

				if (classes.indexOf(toCheck) > -1) {
					return true;
				}

				return false;
			}
		};

	$(init.main);

}(jQuery));
