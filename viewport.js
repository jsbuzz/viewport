// Array dependencies for IE < 9.0
if(!Array.prototype.forEach) {
	Array.prototype.forEach = function(callBack) {
		for (var i = 0; i < this.length; i++) {
			callBack.call(this[i], this[i], i);
		}
	};
}
if(!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(item) {
		for (var i = 0; i < this.length; i++) {
			if(this[i] === item) {
				return i;
			}
		}
		return -1;
	};
}

// jQuery plugin
(function($) {

	var lastScrollTop = 0,
		scrollDirection = 1,
		insideEvents = ['reach', 'lock'];

	$.viewPort = {
		elements   : [],
		guideLines : [
			new GuideLine('top',     0  ),
			new GuideLine('horizon', 0.5),
			new GuideLine('bottom',  1  )
		],
		findElement   : findElement,
		addElement    : addElement,
		removeElement : removeElement
	};

	$.fn.viewPort = function(eventHandlers) {

		for(var eventCode in eventHandlers) {
			if(!eventHandlers.hasOwnProperty(eventCode)) {
				continue;
			}
			var fn = eventHandlers[eventCode] ;
			$(this).each(function() {
				$(this).on(eventCode, eventHandlers[eventCode]);
				$.viewPort.addElement(this);
			});

		}

		return this;
	};

	$(window).scroll(viewPortCheck);

	// initial viewport events - TODO: find a nicer solution than timeout 100...
	$(function() {
		window.setTimeout(viewPortCheck, 100);
	});

	return $.viewPort;

	function viewPortCheck() {
		scrollDirection = $(window).scrollTop() > lastScrollTop ? 1 : -1;
		lastScrollTop = $(window).scrollTop();

		$.viewPort.elements.forEach(function(el) {
			$.viewPort.guideLines.forEach(function(guideLine) {
				guideLine.check(el);
			});
		});
	}

	function GuideLine(name, position) {
		this.name = name;
		this.position = position;

		/* dragging to be implemented
		this.drag = drag;
		this.release = release;
		this.handleDragged = handleDragged;
		*/

		this.check = function(el) {
			el.lastEvent || (el.lastEvent = {});
			var elementTop = $(el).offset().top,
				elementBottom = elementTop + el.getBoundingClientRect().height,
				elementMiddle = elementTop + (elementBottom - elementTop) / 2,
				offset = parseInt(document.documentElement.clientHeight * this.position),
				myTop = $(window).scrollTop() + offset,
				lastEvent = el.lastEvent[this.name],
				event = false;

			// outside the element
			if(myTop < elementTop || myTop > elementBottom) {
				if(lastEvent && insideEvents.indexOf(lastEvent.name) >= 0) {
					event = 'leave';
				} else if(
					myTop < elementTop && lastEvent && lastEvent.direction === 1 || 
					myTop > elementBottom && (!lastEvent || lastEvent.direction === -1)
				) {
					event = 'skip';
				}

			// inside the element
			} else {
				if(scrollDirection === 1) {
					if(!lastEvent || insideEvents.indexOf(lastEvent.name) < 0) {
						event = 'reach';
					} else if(myTop >= elementMiddle && lastEvent && lastEvent.name === 'reach' && lastEvent.direction === 1) {
						event = 'lock';
					}
				} else {
					if(!lastEvent || insideEvents.indexOf(lastEvent.name) < 0) {
						event = 'reach';
					} else if(myTop <= elementMiddle && lastEvent && lastEvent.name === 'reach' && lastEvent.direction === -1) {
						event = 'lock';
					}					
				}
			}

			if(event) {
				el.lastEvent[this.name] = {
					name      : event,
					direction : scrollDirection
				};
				this.offset = offset;
				this.y = myTop;
				var details = {
						guideLine: this,
						top: elementTop,
						middle: elementMiddle,
						bottom: elementBottom,
						scrollDirection: scrollDirection
				};
				$(el).trigger(this.name + ':' + event, details);
			}
		};
	}

	function createEvent(type, offset) {
		return new CustomEvent(
			type, 
			{
				detail: offset,
				bubbles: true,
				cancelable: true
			}
		);
	}

	function findElement(el) {
		for(var i=0; i < this.elements.length; i++) {
			if($(this.elements[i]).is(el)) {
				return i;
			}
		}
		return -1;
	}

	function addElement(el) {
		if(this.findElement(el)!==-1) {
			return false;
		}
		this.elements.push(el);
	}

	function removeElement(el) {
		var i = this.findElement(el);
		if(i > -1) {
			this.elements.splice(i, 1);
			return true;
		}
		return false;
	}

})(jQuery);
