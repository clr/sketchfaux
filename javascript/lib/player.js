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


