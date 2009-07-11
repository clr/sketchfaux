libraries = function(){
  return [
    'pepper',
    'event',
    'interface',
    'style',
    'player',
    'canvas'
  ];
};

loadJavascriptLibrary = function( root ){
  var ourLibraries = libraries();
  var allLibraries = [
  	"../ui.core",
    "../ui.slider",
    "../vendor/colorpicker/js/colorpicker",
    "../vendor/colorpicker/js/eye",
    "../vendor/colorpicker/js/utils"
  ].concat( ourLibraries );
  for( i = 0; i < allLibraries.length; i++ ){
    var library = document.createElement( 'script' );
    library.setAttribute( "type", "text/javascript" );
    library.setAttribute( "src", root + '/src/' + allLibraries[i] + '.js' );
    document.getElementsByTagName( 'head' )[0].appendChild( library );
  }
}

var root = document.location.toString().split( "\/test", 1 )[0];
loadJavascriptLibrary( root );

$( function(){

  // Create the unit test selector.
  $( '#banner' ).append( $( "<span style='color:white;'>unit tests: </span><select id='unit_test_select'></select>" ) );
  $( [ '' ].concat( libraries() ) ).each( function( i, test ){ 
    var option = $( '<option>'+test+'</option>' );
    $( '#unit_test_select' ).append( option );
    $( option ).data( 'url', document.location.toString().split( "\/test\/", 1 )[0] + '/test/' + test + '.qunit' );
  });
  $( '#unit_test_select' ).change( function(){
    var url = $( $( '#unit_test_select option:selected' )[0] ).data( 'url' );
    if( url.length > 0 ){
      document.location = url;
    }
  });

})
