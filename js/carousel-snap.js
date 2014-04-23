/* global jQuery */

/**************************************************************
 *
 * Circular Carousel Ready for Lazy Loading 2.0.2
 *
 **************************************************************/

( function ( $ ) {
	'use strict';

	var CarouselSnap = function ( element, settings ) {

		var availableItems;
		var elementsToMove  = settings.elementsToMoveOnClick;
		var container       = $( element );
		var shiftLeftCount  = 0;
		var shiftRightCount = 0;
		var countAnimate    = 1;
		var timeoutId       = null;
		var _this           = this;
		var availablePanes  = 1;

		this.itemsToBeAdded         = '';
		this.requestForAppendActive = false;
		this.rotate                 = settings.rotate;
		this.activePane             = 1;

		this.setItemsToBeAdded = function ( items ) {
			_this.itemsToBeAdded = _this.itemsToBeAdded + items;
		};

		var getAvailableItems = function () {
			return container.children().length;
		};

		var getTotalPanes = function () {
			return ( Math.ceil( getAvailableItems() / elementsToMove ) );
		};

		var hidePrevNextLink = function () {
			container.parent().find('.prevNext').hide();
			unbindListenToClick( 'both' );
		};

		var showPrevNextLink = function () {
			container.parent().find('.prevNext').show();
		};

		var getContainerWidth = function () {
			return getAvailableItems() * container.children().outerWidth( true );
		};

		var getparentHolderWidth = function () {
			return container.parent().outerWidth();
		};

		var getWidthPerItem = function () {
			return container.children().outerWidth( true );
		};

		var moveby     = '-=' + ( getWidthPerItem() * elementsToMove ) + 'px';
		var movebyPrev = '+=' + ( getWidthPerItem() * elementsToMove ) + 'px';

		var setContainerWidth = function () {
			container.css( 'width', getContainerWidth( container ) );
		};

		var alignCenter = function ( alignFlag ) {
			var nonvisibleItems = ( getContainerWidth() - getparentHolderWidth() ) / getWidthPerItem();
			var itemsToShift;
			if ( alignFlag ) {
				itemsToShift = Math.floor( nonvisibleItems / 2 );
			} else {
				itemsToShift = 0;
			}
			for ( var i = 0; i < getAvailableItems(); i++ ) {
				var moveByItem = getWidthPerItem() * ( i  - itemsToShift );
				container.children().eq( i ).css( 'left', moveByItem );
			}
		};

		var checkItemsTotal = function () {
			availablePanes = getTotalPanes();
			if ( getAvailableItems() <= elementsToMove ) {
				hidePrevNextLink();
				alignCenter( false );
				return false;
			} else {
				alignCenter( settings.alignCenter );
				return true;
			}
		};

		var hideShowLinks = function () {
			if ( getAvailableItems() === ( getContainerWidth/getWidthPerItem ) ) {
				hidePrevNextLink();
			} else {
				showPrevNextLink();
			}
		};

		this.updateItemPosition = function () {
			availableItems = getAvailableItems();
			if ( getAvailableItems() ) {
				hideShowLinks();
				for ( var i = 1; i < getAvailableItems(); i++ ) {
					var previousLeft = container.children().eq( i - 1 ).position().left;
					container.children().eq( i ).css( {
						'left'     : previousLeft + getWidthPerItem(),
						'position' : 'absolute'
					} );
				}
				checkItemsTotal();
			}
		};

		var appendPrevNextButtons = function ( newInstance ) {
			if ( newInstance ) {
				container.after( '<div class="prevNext prevLink active" id="' + settings.prevID + '">Previous</div><div class="prevNext nextLink" id="' + settings.nextID + '">Next</div>' );
				unbindListenToClick( 'prev' );
			} else {
				hideShowLinks();
			}
		};

		var addStylesToItems = function ( start, addClass ) {
			for (var i = start; i < getAvailableItems(); i++ ) {
				container.children().eq( i ).css( 'position', 'absolute' );
			}
			if ( addClass ) {
				for (var j = start; j < getAvailableItems(); j++ ) {
					container.children().eq( j ).addClass( 'carousel-snap-' + j );
				}
			}
		};

		var lastItemLeftValue = function () {
			return container.children().last().position().left;
		};

		var firstItemLeftValue = function () {
			return container.children().first().position().left;
		};

		var appendTempItems = function ( shiftedToLeft ) {
			if ( shiftedToLeft ) {
				var lastItemLeftValueInt = lastItemLeftValue();
				for ( var i = 1; i <= elementsToMove; i++ ) {
					var clonedItem = container.children().eq( i - 1 ).clone( true );
					container.append( clonedItem.css( 'left', lastItemLeftValueInt + getWidthPerItem() * i ) );
				}
			} else {
				var firstItemLeftValueInt = firstItemLeftValue();
				availableItems = getAvailableItems();
				for ( var j = 1; j <= elementsToMove; j++ ) {
					var clonedItemR = container.children().eq( availableItems - 1 ).clone( true );
					container.prepend( clonedItemR.css( 'left', firstItemLeftValueInt - getWidthPerItem() * j ) );
				}
			}
		};

		this.checkForNewItems = function () {
			if ( _this.requestForAppendActive ) {
				var currentItemsLength = getAvailableItems();
				var lastItemLeftValueInt = lastItemLeftValue();
				container.append( _this.itemsToBeAdded );
				for (var i = currentItemsLength; i < getAvailableItems(); i++) {
					var leftValue = lastItemLeftValueInt + ( getWidthPerItem() * ( i - currentItemsLength + 1 ) );
					container.children().eq( i ).css( 'left', leftValue );
				}
				addStylesToItems( currentItemsLength, true );
				_this.requestForAppendActive = false;
				_this.itemsToBeAdded = '';
				availablePanes = getTotalPanes();
				activePaneActions();
			}
		};

		var activePaneActions = function () {
			if ( !_this.rotate ) {
				if ( _this.activePane > 1 ) {
					listenToClick( 'prev' );
				} else {
					unbindListenToClick( 'prev' );
				}
				if ( availablePanes > _this.activePane ) {
					listenToClick( 'next' );
				} else {
					unbindListenToClick( 'next' );
					settings.lastPaneEvent();
				}
			}
		};

		var updateActivePane = function ( inc ) {
			if ( inc ) {
				if ( _this.activePane === availablePanes ) {
					_this.activePane = 1;
				} else {
					_this.activePane++;
				}
			} else {
				if ( _this.activePane === 1 ) {
					_this.activePane = availablePanes;
				} else {
					_this.activePane--;
				}
			}
			activePaneActions();
		};

		var resetAfterCompleteAnimation = function ( shiftedToLeft ) {
			_this.checkForNewItems();
			listenToClick( 'both' );
			countAnimate         = 1;
			shiftLeftCount       = 0;
			shiftRightCount      = 0;
			updateActivePane( shiftedToLeft );
			settings.afterShift();
		};

		var removeTempItems = function ( shiftedToLeft, callback ) {
			if ( countAnimate === getAvailableItems() ) {
				if ( _this.rotate ) {
					if ( shiftedToLeft ) {
						for ( var i = 1; i <= elementsToMove; i++ ) {
							container.children().first().remove();
						}
					} else {
						for ( var j = 1; j <= elementsToMove; j++ ) {
							container.children().last().remove();
						}
					}
				}
				callback();
			} else {
				countAnimate++;
			}
		};

		var checkEvent = function( isPrev , event ) {
			var arrows = [ '#' + settings.nextID, '#' + settings.prevID ];
			if ( event !== undefined ) {
				elementsToMove = settings.elementsToMoveOnClick;
				triggerLeaveHover( arrows[ isPrev ] );
			} else {
				elementsToMove = settings.elementsToMoveOnHover;
			}
			moveby     = '-=' + ( getWidthPerItem() * elementsToMove ) + 'px';
			movebyPrev = '+=' + ( getWidthPerItem() * elementsToMove ) + 'px';
		};

		var shiftLeft = function ( event ) {
			if ( !shiftLeftCount ) {
				settings.beforeShift();
				checkEvent( 0 , event );
				if ( _this.rotate ) {
					appendTempItems( true );
				}
				unbindListenToClick( 'both' );
				container.children().animate( {
					'left': moveby
				}, {
						'start'    : function() {

						},
						'complete' : function () {
							removeTempItems( true, function () {
								resetAfterCompleteAnimation( true );
							} );
						}
				} );
			}
			shiftLeftCount++;
		};

		var shiftRight = function ( event ) {
			if( !shiftRightCount ) {
				settings.beforeShift();
				checkEvent( 1 , event );
				if ( _this.rotate ) {
					appendTempItems( false );
				}
				unbindListenToClick( 'both' );
				container.children().animate( {
					'left': movebyPrev
				}, {
						'start'    : function() {

						},
						'complete' : function () {
							removeTempItems( false, function () {
								resetAfterCompleteAnimation( false );
							} );
						}
				} );
			}
			shiftRightCount++;
		};

		var onHover = function( element, callback ) {
			$( element ).hover( function() {
				if ( !timeoutId ) {
					timeoutId = window.setInterval( function() {
						callback();
					}, settings.time );
				}
			}, function() {
				if ( timeoutId ) {
					window.clearInterval( timeoutId );
					timeoutId = null;
				}
			} );
		};

		var triggerLeaveHover = function( element ) {
			window.clearInterval( timeoutId );
			timeoutId = null;
			$( element ).trigger( 'mouseleave' );
			$( element ).trigger( 'mouseenter' );
		};

		var listenToHover = function() {
			onHover( '#' + settings.nextID, shiftLeft );
			onHover( '#' + settings.prevID, shiftRight );
		};

		var listenToClick = function ( element ) {
			switch ( element ) {
				case 'both' :
					$( '#' + settings.nextID ).on( 'click',  shiftLeft ).addClass( 'active' );
					$( '#' + settings.prevID ).on( 'click', shiftRight ).addClass( 'active' );
					break;
				case 'next' :
					$( '#' + settings.nextID ).on( 'click',  shiftLeft ).addClass( 'active' );
					break;
				case 'prev' :
					$( '#' + settings.prevID ).on( 'click',  shiftRight ).addClass( 'active' );
					break;
			}
		};

		var unbindListenToClick = function ( element ) {
			switch ( element ) {
				case 'both' :
					$( '#' + settings.nextID ).off( 'click',  shiftLeft ).removeClass( 'active' );
					$( '#' + settings.prevID ).off( 'click', shiftRight ).removeClass( 'active' );
					break;
				case 'next' :
					$( '#' + settings.nextID ).off( 'click',  shiftLeft ).removeClass( 'active' );
					break;
				case 'prev' :
					$( '#' + settings.prevID ).off( 'click',  shiftRight ).removeClass( 'active' );
					break;
			}
		};

		this.rotateCarousel = function ( state ) {
			if ( state ) {
				listenToClick( 'both' );
			}
		};

		this.reset = function ( pane ) {
			container.children().first().css( 'left', 0 );
			this.initialize( false );
			_this.activePane = 1;
			if ( pane ) {
				this.shiftPanes ( pane );
			}
		};

		this.shiftPanes = function ( panes ) {
			var elementsToShift = ( panes - 1 ) * elementsToMove;
			for ( var i = 0; i < getAvailableItems(); i++ ) {
				var moveByItem = getWidthPerItem() * ( i  - elementsToShift );
				container.children().eq( i ).css( 'left', moveByItem );
			}
			_this.activePane = panes;
		};

		this.initialize = function ( newInstance ) {
			setContainerWidth();
			appendPrevNextButtons( newInstance );
			addStylesToItems( 0, true );
			if ( checkItemsTotal() ) {
				if ( _this.activePane === 1 && !_this.rotate ) {
					listenToClick( 'next' );
				} else {
					listenToClick( 'both' );
				}
				listenToHover();
			}
		};

	};

	$.fn.carouselSnap = function ( options ) {
		return this.each( function ( key, value ) {
			var element      = $( this );
			var settings     = $.extend( {}, $.fn.carouselSnap.defaults, options );
			var carouselSnap = element.data( 'carouselSnap' );
			var newInstance  = false;
			if ( !carouselSnap ) {
				carouselSnap = new CarouselSnap( this, settings );
				element.data( 'carouselSnap', carouselSnap );
				newInstance = true;
			}
			carouselSnap.initialize( newInstance );
		} );
	};

	$.fn.carouselRotate = function ( state, callback ) {
		return this.each( function ( key, value ) {
			var carousel = $( this ).data( 'carouselSnap' );
			var success  = false;
			var msg      = 'Item not an instance of carouselSnap';
			if ( carousel ) {
				success         = true;
				carousel.rotate = state;
				carousel.rotateCarousel( state );
				msg = 'Successfully updated carousel rotate option';
			}
			if ( callback ) {
				callback( success, msg );
			}
		} );
	};

	$.fn.getActivePane = function ( callback ) {
		return this.each( function ( key, value ) {
			var carousel   = $( this ).data( 'carouselSnap' );
			var activePane = null;
			var msg        = 'Item not an instance of carouselSnap';
			if ( carousel ) {
				activePane = carousel.activePane;
				msg     = 'Active pane ' + activePane;
			}
			if ( callback ) {
				callback( activePane, msg );
			}
		} );
	};

	$.fn.shiftOnPane = function ( pane, callback ) {
		return this.each( function ( key, value ) {
			var carousel = $( this ).data( 'carouselSnap' );
			var success  = null;
			var msg      = 'Item not an instance of carouselSnap';
			if ( carousel ) {
				carousel.reset( pane );
				msg     = 'Successfully shifted on pane ' + pane;
				success = true;
			}
			if ( callback ) {
				callback( success, msg );
			}
		} );
	};

	$.fn.carouselAppend = function ( items, callback ) {
		return this.each( function ( key, value ) {
			var carousel = $( this ).data( 'carouselSnap' );
			var success  = false;
			var msg      = 'Item not an instance of carouselSnap';
			if ( carousel ) {
				success = true;
				msg     = 'Items successfully appended';
				carousel.setItemsToBeAdded( items );
				carousel.requestForAppendActive = true;
				carousel.checkForNewItems();
			}
			if ( callback ) {
				callback( success, msg );
			}
		} );
	};

	$.fn.carouselRemove = function ( e, callback ) {
		var carousel = $( e ).parent().data( 'carouselSnap' );
		var success  = false;
		var msg      = 'Item not an instance of carouselSnap';
		if ( carousel ) {
			$( e ).remove();
			carousel.updateItemPosition();
			success = true;
			msg     = 'Item successfully removed';
		}
		if ( callback ) {
			callback( success, msg );
		}
	};

	$.fn.carouselSnap.defaults = {
		nextID                : 'next-slide',
		prevID                : 'previous-slide',
		elementsToMoveOnClick : 1,
		elementsToMoveOnHover : 1,
		startOnCenter         : true,
		rotate                : true,
		time                  : 10000,
		beforeShift           : function () {},
		afterShift            : function () {},
		lastPaneEvent         : function () {}
	};

} )( jQuery );