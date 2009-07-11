/*
 * sketchfaux 0.7.59 - SketchFaux Drawing Canvas
 *
 * Copyright (c) 2009 Casey Rosenthal (github.net/clr)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2009-07-11 Sat Jul 11 18:02:58 -0400 2009 $
 * $Rev: 1 more than last time $
 */
 
// This file contains various helper methods.


// Sugar functions follow, some of which were inspired by
// [ http://www.crockford.com/javascript/inheritance.html ]
Function.prototype.method = function( name, lambda ){
  this.prototype[name] = lambda;
  return this;
};

// To be used as in ChildClass.inherits( ParentClass )
Function.method( 'inherits', function( parent ) {
  var d = {};
  var p = ( this.prototype = new parent() );

  this.method( '_super', function _super( name ){
    if( !( name in d ) ){
      d[name] = 0;
    }        
    var f, r, t = d[name];
    var v = parent.prototype;
    if( t ){
      while( t ){
        v = v.constructor.prototype;
        t -= 1;
      }
      f = v[name];
    } else {
      f = p[name];
      if( f == this[name] ){
        f = v[name];
      }
    }
    d[name] += 1;
    r = f.apply( this, Array.prototype.slice.apply( arguments, [1] ) );
    d[name] -= 1;
    return r;
  });
  return this;
});

Function.method( 'swiss', function( parent ){
  for( var i = 1; i < arguments.length; i++ ){
    var name = arguments[i];
    this.prototype[name] = parent.prototype[name];
  }
  return this;
});

Function.prototype.bind = function( object ){
  var method = this;
  var temp = function() {
    return method.apply( object, arguments );
   };
  return temp;
} 

// Camel case is useful for generating dynamic functions.
String.method( 'toCamelCase', function(){
  if( this.length < 1 ){
    return this;
  }
  var newString = '';
  var parts = this.split( /[^a-zA-Z0-9]/ );
  for( var i = 0; i < parts.length; i++ ){
    var part = parts[i];
    if( part.length > 0 ){
      newString += ( part[0].toUpperCase() + part.slice( 1 ) );
    }
  }
  return newString;
});

// This is just to test to make sure that my Psuedo-class structure is sound.
DummyPepperClass = function(){
  this.dummyAttr = null;
};
DummyPepperClass.method( 'getDummyAttr', function(){
  return this.dummyAttr;
});
DummyPepperClass.method( 'setDummyAttr', function( newValue ){
  this.dummyAttr = newValue;
  return this;
});

// Surprised that javascript doesn't have a function like .includes?()
Array.method( 'hasElement', function ( element ){
  for( var i = 0; i < this.length; i++ ){
    if( element == this[i] ){
      return true;
    }
  }
  return false;
});
// Same thing for a NodeList.
NodeList.prototype.hasElement = function ( element ){
  for( var i = 0; i < this.length; i++ ){
    if( element == this.item( i ) ){
      return true;
    }
  }
  return false;
};

// First element.
Array.method( 'first', function (){
  return this[0];
});

// Last element.
Array.method( 'last', function (){
  return this[ this.length - 1 ];
});

// Return the firts value that isn't null.
notNull = function(){
  for( var i = 0; i < arguments.length; i++ ){
    var value = arguments[i];
    if( value != null ){
      return value;
    }
  }
};

// We need to trigger events for testing purposes.  This library is 
// inspired by, and borrows some code from:
// http://groups.google.com/group/comp.lang.javascript/browse_thread/thread/27e7c70e51ff8a99/98cea9cdf065a524%2398cea9cdf065a524
Event = function( species ){
  this.species = species;
};

Event.method( 'trigger', function( domElement ){
  if( !domElement ) {
    alert( 'Cannot trigger an event into the ether; must be attached to a DOM element.' );
  }
  if( document.createEvent ) {
    event = document.createEvent( 'MouseEvents' );
  }
  event.initMouseEvent(
    this.species,
    true,     // Click events bubble
    true,     // and they can be cancelled
    document.defaultView,  // Use the default view
    1,        // Just a single click
    0,        // Don't bother with co-ordinates
    0,
    0,
    0,
    false,    // Don't apply any key modifiers
    false,
    false,
    false,
    0,        // 0 - left, 1 - middle, 2 - right
    null
  );
  domElement.dispatchEvent( event );
});

// This class waits for mouse events, and updates its canvas array 
// based on the event.
Interface = function( context, url ){
  this.context = context;
  this.url = url;
  /*
     Could store this as psuedo-objects, but for simplicity-sake,
     I'm just going to save it as JSON in the following structure.
     See doc/discussion.txt for more info.
       { l: [ // lines
          { 
            s: { // style
              c: "#000000", // color
              o: 1.0, // opacity
              d: 2 // diameter
            },
            p: [ // points
              [ x0, y0 ],
              [ x1, y1 ],
              ...
              [ xN, yN ]
            ]
          },
          {
            ...
          }
        ]
      } 
  */
  this.data = {
    l: []
  };
  this.pencilOnCanvas = false;
  this.currentLine = null;
  // Generate all of the DOM elements.
  this
    .generateCanvas()
    .generateColorPicker()
    .generateOpacityPicker()
    .generateSizePicker()
    .generateSaver()
    .generateButtons()
    .generateStyle()
    .generatePlayer()
    .generateDataFromUrl();
  
  var that = this;

  /*  Mouse Down  */
  this.getCanvasHolder().mousedown( function( mouseEvent ){
    var coordinates = that.normalizeCoordinates( mouseEvent, this );
    // Stop any playback, if it's going on.
    that.stop.trigger( 'click' );
    // Put the pencil on the canvas.
    that.pencilDown();
    // Create a line in the JSON data structure.
    that.createLine();
    // Append the line to this object.
    that.data.l.push( that.getCurrentLine() );
    // Append the origin point to the current line.
    that.currentLine.p.push( [ coordinates[0], coordinates[1] ] );

    // Draw the line into <canvas> context.
    that.getCanvas().createLine( [ coordinates[0], coordinates[1] ], {
      diameter: that.getCurrentLine().s.d,
      color: that.getCurrentLine().s.c,
      opacity: that.getCurrentLine().s.o
    } );
    
    // We now have the option to 'undo' a line segment.
    that.undo.removeClass( 'disabled' );
    that.saver.removeClass( 'disabled' );

  });
  
  /*  Mouse Move  */
  this.getCanvasHolder().mousemove( function( mouseEvent ){
    if( that.isPencilOnCanvas() ) {
      var coordinates = that.normalizeCoordinates( mouseEvent, this );

      // Append the point data to the current line.
      that.getCurrentLine().p.push( [ coordinates[0], coordinates[1] ] );

      // Draw the segment into <canvas> context.
      that.getCanvas().createSegment( [ coordinates[0], coordinates[1] ] );
    }
  });
   
  /*  Mouse Up  */
  this.getCanvasHolder().mouseup( function( mouseEvent ){
    // Pull the pencil off the canvas.
    that.pencilUp();
  });
   
  return this;
};

Interface.method( 'getContext', function(){
  return this.context;
});

Interface.method( 'getData', function(){
  return this.data;
});

Interface.method( 'getCurrentLine', function(){
  return this.currentLine;
});

Interface.method( 'pencilDown', function(){
  this.pencilOnCanvas = true;
});

Interface.method( 'pencilUp', function(){
  this.pencilOnCanvas = false;
});

Interface.method( 'isPencilOnCanvas', function(){
  return this.pencilOnCanvas;
});

Interface.method( 'createLine', function(){
  this.currentLine = { 
    s: this.getStyle().getStyle(),
    p: []
  };
  return this;
});

// Get rid of the current line from the data and from the canvas
// scratch layer.
Interface.method( 'undoLine', function(){
  if( this.getCurrentLine() == this.data.l.last() ){
    this.data.l.pop();
    this.getCanvas().clearScratchCanvasElement();
  }
});

Interface.method( 'normalizeCoordinates', function( mouseEvent, element ){
  var offset = $( element ).offset();
  return [ ( mouseEvent.pageX - offset.left - 4 ), ( mouseEvent.pageY - offset.top - 4) ];
});

/*  Canvas Element  */
Interface.method( 'generateCanvas', function(){
  this.canvasHolder = $( "<div><canvas></canvas></div>" );
  this.canvasHolder.addClass( 'canvas_holder' );
  this.canvas = new Canvas( this.canvasHolder.find( '> canvas' )[0] );
  this.canvasHolder.appendTo( this.getContext() );
  return this;
});

Interface.method( 'getCanvasHolder', function(){
  return this.canvasHolder;
});

Interface.method( 'getCanvas', function(){
  return this.canvas;
});

/*  ColorPicker  */
Interface.method( 'generateColorPicker', function(){
  this.colorPicker = $( "<div></div>" );
  this.colorPicker.addClass( 'color_picker_holder' );
  // Call vendor colorpicker library.
  $( this.colorPicker ).ColorPicker( {flat: true} );
  $( this.getContext() ).append( this.colorPicker );
  return this;
});

Interface.method( 'getColorPicker', function(){
  return this.colorPicker;
});

/*  SizePicker  */
Interface.method( 'generateSizePicker', function(){
  this.sizePicker = $( "<div><div><span>SIZE</span><div></div></div></div>" );
  this.sizePicker.addClass( 'size_picker_holder' );
  this.sizePicker.find( '> div' ).addClass( 'generic_slider' );
  this.size = this.sizePicker.find( '> div > div' )[0];
  $( this.size ).slider( { min: 1, max: 100, value: 4 } );
  $( this.getContext() ).append( this.sizePicker );
  return this;
});

Interface.method( 'getSizePicker', function(){
  return this.sizePicker;
});

/*  OpacityPicker  */
Interface.method( 'generateOpacityPicker', function(){
  this.opacityPicker = $( "<div><div><span>OPACITY</span><div></div></div></div>" );
  this.opacityPicker.addClass( 'opacity_picker_holder' );
  this.opacityPicker.find( '> div' ).addClass( 'generic_slider' );
  this.opacity = this.opacityPicker.find( '> div > div' )[0];
  $( this.opacity ).slider( { min: 0, max: 100, value: 100 } );
  $( this.getContext() ).append( this.opacityPicker );
  return this;
});

Interface.method( 'getOpacityPicker', function(){
  return this.opacityPicker;
});


/*  Buttons  */
Interface.method( 'generateButtons', function(){
  var that = this;
  this.toolbar = $( "<div></div>" );
  this.toolbar
    .addClass( 'button_toolbar' )
    .appendTo( this.getContext() );
  // 'Replay' button.
  this.replay = $( "<button>REPLAY</button>" );
  this.replay
    .addClass( 'generic_button' )
    .addClass( 'replay' )
    .appendTo( this.toolbar )
    .click( function(){
      that.getPlayer().replay();
      that.stop.removeClass( 'disabled' );
      // Prevent this event from continuing propogation.
      return false;
    });
  // 'Stop' button.
  this.stop = $( "<button>STOP</button>" );
  this.stop
    .addClass( 'generic_button' )
    .addClass( 'stop' )
    .addClass( 'disabled' )
    .appendTo( this.toolbar )
    .click( function(){
      that.getPlayer().stop();
      that.stop.addClass( 'disabled' );
      // Prevent this event from continuing propogation.
      return false;
    });
  // 'Speed' slider.
  this.speedPicker = $( "<div><div><span>PLAYBACK SPEED</span><div></div></div></div>" );
  this.speedPicker.addClass( 'speed_picker_holder' );
  this.speedPicker.find( '> div' ).addClass( 'thin_slider' );
  this.speed = this.speedPicker.find( '> div > div' )[0];
  $( this.speed ).slider( { min: 0, max: 150, value: 150 } );
  $( this.toolbar ).append( this.speedPicker );
  // 'Undo' button.
  this.undo = $( "<button>UNDO</button>" );
  this.undo
    .addClass( 'generic_button' )
    .addClass( 'undo' )
    .addClass( 'disabled' )
    .appendTo( this.toolbar )
    .click( function(){
      that.undoLine();
      that.undo.addClass( 'disabled' );
      // Prevent this event from continuing propogation.
      return false;
    });
  return this;
});


/*  Saver Form  */
Interface.method( 'generateSaver', function(){
  var that = this;
  this.saverHolder = $( "<div><span>save this sketch as:</span><input type='text' name='name' id='sketch_name' /></div>" );
  this.saverHolder
    .addClass( 'saver_holder' )
    .appendTo( this.getContext() );
  this.saver = $( "<button>SAVE</button>" );
  this.saver
    .addClass( 'generic_button' )
    .appendTo( this.saverHolder )
    .click( function(){
      that.save();
      that.saver.addClass( 'disabled' );
      // Prevent this event from continuing propogation.
      return false;
    });
  return this;
});

Interface.method( 'getSpeed', function(){
  return 150 - parseInt( $( this.speed ).slider( 'value' ) );
});

/*  Style Object  */
Interface.method( 'generateStyle', function(){
  this.style = new Style( 
    this.getColorPicker(),
    this.opacity,
    this.size
  );
  return this;
});

Interface.method( 'getStyle', function(){
  return this.style;
});

/*  Player Object  */
Interface.method( 'generatePlayer', function( url ){
  this.player = new Player( this );
  return this;
});

Interface.method( 'getPlayer', function(){
  return this.player;
});


/*  AJAX (Using jQuery to handle AJAX.)  */
Interface.method( 'save', function(){
  that = this;
  $.ajax({
    type: "POST",
    url: '/',
    data: {
      'sketch[name]': $( "#sketch_name" )[0].value,
      'sketch[data]': $.toJSON( that.getData() )
    },
    success: function( json ){
      alert( 'Sketch has been saved.' );
    },
  });
});

// Using jQuery to handle AJAX.
Interface.method( 'generateDataFromUrl', function(){
  if( this.hasUrl() ){
    that = this;
    $.ajax({
      type: "GET",
      url: that.url,
      success: function( json ){
        that.data = json;
        that.replay.trigger( 'click' );
      },
      dataFilter: function( data ) {
        if( typeof( JSON ) !== 'undefined' && typeof( JSON.parse ) === 'function' ){ 
          return JSON.parse( data );
        } else {
          return $.secureEvalJSON( data );
        }
      }
    });
  }
});

Interface.method( 'hasUrl', function(){
  if( ( this.url != null ) && ( this.url.length > 0 ) ){
    return true;
  } else {
    return false;
  }
});


/* Extend jQuery to allow invokation of the Interface class on
 * a jQuery object as it's context.
 */
( function( $ ) {
	$.fn.extend({
		sketchfaux: function( playback ){
		  this.each( function () {
		    new Interface( this, playback );
		  });
		}
	});
})(jQuery)
// This class inspects the styleControls DOM element and reports
// the settings back as a JSON object.
Style = function( colorPicker, opacityPicker, sizePicker ){
  this.colorPicker = colorPicker;
  this.opacityPicker = opacityPicker;
  this.sizePicker = sizePicker;
};

Style.method( 'getColor', function(){
  //  Had to modify the vendor library to add the 
  // ColorPickerGetGolor() function.
  return '#' + $( this.colorPicker ).ColorPickerGetColor();
});

Style.method( 'getOpacity', function(){
  return ( ( 0.0 + $( this.opacityPicker ).slider( 'value' ) ) / 100 );
});

// This is in pixels.
Style.method( 'getSize', function(){
  return parseInt( $( this.sizePicker ).slider( 'value' ) );
});

Style.method( 'getStyle', function(){
  return { c: this.getColor(), o: this.getOpacity(), d: this.getSize() };
});


// This class wraps Sassijs and simply loads a file into the template variable.  We
// assume the presence of a loading DOM element 'document'.
Player = function( interface ){
  this.interface = interface;
  this.i = 0; // Line counter.
  this.j = 0; // Point counter.
  this.timeout = null; // Timer firing the draw events.
}

Player.method( 'getData', function(){
  return this.getInterface().getData();
});

// This function and the following call each other, giving us room
// to set a timeout to imitate the playback effect.
Player.method( 'play', function(){
  var that = this;
  this.timeout = setTimeout( function(){ that.frameForward() }, this.getSpeed() );
});

// This function draws the next line segment, or bails if the data
// is done.
Player.method( 'frameForward', function(){
  var data = this.getData().l;
  if( this.j >= data[ this.i ].p.length ){
    // Move to the next line if we're out of points.
    this.i++;
    this.j = 0;
  }
  if( this.i >= data.length ){ 
    // We are at the end of the JSON data, so return here so
    // that the timeout stops running.
    this.getInterface().stop.addClass( 'disabled' );
    return;
  }
  if( this.j == 0 ) { 
    // We are at the beginning of a line, so set the style and 
    // start a new line, drawing the first point.
    var line = data[ this.i ];
    var point = data[ this.i ].p[ this.j ];

    // Draw the line into <canvas> context.
    this.getInterface().getCanvas().createLine( point, {
      diameter: line.s.d,
      color: line.s.c,
      opacity: line.s.o
    } );
  } else {
    // We are in the middle of a line, so just draw this segment.
    var point = data[ this.i ].p[ this.j ];

    // Draw the segment into <canvas> context.
    this.getInterface().getCanvas().createSegment( point );
  }
  // Continue.
  this.j++;
  this.play();
});

// Start the iterators over again.
Player.method( 'replay', function(){
  this.getInterface().getCanvas().cleanSlate();
  this.i = 0;
  this.j = 0;
  this.play();
});

// Clear the timeout to stop the playback effect.
Player.method( 'stop', function(){
  window.clearTimeout( this.timeout );
});

Player.method( 'getInterface', function(){
  return this.interface;
});

Player.method( 'getSpeed', function(){
  return this.getInterface().getSpeed();
});


// We set our canvas configuration here.
Canvas = function( canvasElement ){
  this.canvasElement = canvasElement;
  var width = parseInt( $( this.canvasElement ).css( 'width' ) );
  var height = parseInt( $( this.canvasElement ).css( 'height' ) );
  this.width = ( isNaN( width ) ? 60 : width );
  this.height = ( isNaN( height ) ? 60 : height );
  this.scratchCanvasElement = null;
  this.colorPicker = document.getElementById( 'color_picker' );
  this.cleanSlate();
  return this;
}

// Create a new line in the <canvas> context.
Canvas.method( 'createLine', function( coordinates, options ){

  // Set some default values.
  options.diameter = notNull( options.diameter, 2 );
  options.color    = notNull( options.color,    '#000000' );
  options.opacity  = notNull( options.opacity,  1.0 );

  // Get the context object and start drawing.
  this.collapseScratchCanvasElement();
  this.generateScratchCanvasElement( options.opacity );
  var context = this.getScratchCanvasElement().getContext( '2d' );
  context.lineCap     = 'round';
  context.lineJoin    = 'round';
  context.lineWidth   = options.diameter;
  context.strokeStyle = options.color;
  context.globalAlpha = 1.0;
  context.stroke();
  context.beginPath();

  // Draw the first brush stroke.
  context.lineTo( coordinates[0], coordinates[1] );
  context.stroke();
});

// Create a new segment in the <canvas> context.
Canvas.method( 'createSegment', function( coordinates ){
  // Get the context object and continue drawing.
  var context = this.getScratchCanvasElement().getContext( '2d' );
  context.lineTo( coordinates[0], coordinates[1] );
  context.stroke();
});

Canvas.method( 'getCanvasElement', function(){
  return this.canvasElement;
});

Canvas.method( 'getOffset', function(){
  if( this.getCanvasElement().parentNode.boxObject ){
    // XUL
    return [ this.getCanvasElement().parentNode.boxObject.x, this.getCanvasElement().parentNode.boxObject.y ];
  } else {
    // HTML
    return [ this.getCanvasElement().parentNode.offsetLeft, this.getCanvasElement().parentNode.offsetTop ];
  }
});

// Create a new segment in the <canvas> context.
Canvas.method( 'collapseScratchCanvasElement', function(){
  if( this.getScratchCanvasElement() != null ){
    var scratchContext = this.getScratchCanvasElement().getContext( '2d' );
    var imageData = scratchContext.getImageData( 0, 0, this.width, this.height );
    var pixels    = imageData.data;
    var opacity   = this.getScratchCanvasElement().style.opacity;
    
    // Loop through all the pixels and apply the opacity.
    for( var i = 0, n = pixels.length; i < n; i += 4 ) {
      pixels[ i + 3 ] = parseInt( opacity * pixels[ i + 3 ] );
    }
    scratchContext.putImageData( imageData, 0, 0 );
    
    this.getCanvasElement().getContext( '2d' ).drawImage( this.getScratchCanvasElement(), 0, 0 );
    this.clearScratchCanvasElement();
  }
});

// Create a new segment in the <canvas> context.
Canvas.method( 'clearScratchCanvasElement', function(){
  if( this.getCanvasElement().parentNode.childNodes.hasElement( this.getScratchCanvasElement() ) ){
    this.getCanvasElement().parentNode.removeChild( this.getScratchCanvasElement() );
  }
  this.setScratchCanvasElement( null );
});

// Create a new segment in the <canvas> context.
Canvas.method( 'generateScratchCanvasElement', function( opacity ){
  var newCanvasElement = $( "<canvas></canvas>");
  newCanvasElement.appendTo( this.getCanvasElement().parentNode );

  newCanvasElement.attr( 'width', this.width );
  newCanvasElement.attr( 'height', this.height );
  newCanvasElement.css( 'opacity', opacity );
  newCanvasElement.css( 'z-index', '2' );
  this.scratchCanvasElement = newCanvasElement[0];
});

Canvas.method( 'setScratchCanvasElement', function( scratchCanvasElement ){
  this.scratchCanvasElement = scratchCanvasElement;
  return this;
});

Canvas.method( 'getScratchCanvasElement', function(){
  return this.scratchCanvasElement;
});

// We initialize the canvas as we see it onload with this command.
Canvas.method( 'cleanSlate', function(){
  this.getCanvasElement().setAttribute( 'width', this.width );
  this.getCanvasElement().setAttribute( 'height', this.height );
  this.getCanvasElement().setAttribute( 'style', 'z-index:1' );
  this.clearScratchCanvasElement();

  // Get context
  context = this.getCanvasElement().getContext( '2d' );

  // Create the frame
  context.clearRect( 0, 0, this.width, this.height );
  context.fillStyle = "white";
  context.fillRect( 0, 0, this.width, this.height );
});

