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
			$(this).each(function() {
				$(this).on(eventCode, eventHandlers[eventCode]);
				$.viewPort.addElement(this);
			});

		}

		return this;
	};

	$(document).scroll(function(ev) {
		scrollDirection = window.scrollY > lastScrollTop ? 1 : -1;
		lastScrollTop = window.scrollY;

		$.viewPort.elements.forEach(function(el) {
			$.viewPort.guideLines.forEach(function(guideLine) {
				guideLine.check(el);
			});
		})
	});

	return $.viewPort;

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
				myTop = window.scrollY + offset,
				lastEvent = el.lastEvent[this.name],
				event = false;

			if(myTop < elementTop || myTop > elementBottom) {
				if(lastEvent && insideEvents.indexOf(lastEvent.name) >= 0) {
					event = 'leave';
				} else if(
					myTop < elementTop && lastEvent && lastEvent.direction === 1 || 
					myTop > elementBottom && (!lastEvent || lastEvent.direction === -1)
				) {
					event = 'skip';
				}
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
				$(el).trigger(
					createEvent(this.name + ':' + event,{
						top: elementTop,
						middle: elementMiddle,
						bottom: elementBottom,
						scrollDirection: scrollDirection
					}),
					this
				);
			}
		}
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
			if(this.elements[i].isSameNode(el)) {
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
