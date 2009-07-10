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

