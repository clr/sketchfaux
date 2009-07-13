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
      'sketch[data]': $.toJSON( that.getData() ),
      'sketch[thumbnail]': that.getCanvas().getThumbnail()
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
        if( ( typeof( JSON ) !== 'undefined' ) && ( typeof( JSON.parse ) === 'function' ) ){ 
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
