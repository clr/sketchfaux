require "#{File.dirname(__FILE__)}/spec_helper"

describe 'sketch' do

  specify 'should include the foggy_winter_day sketch' do
    Sketch.find_all.should include( 'foggy_winter_day' )
  end

  specify 'should take a sketch name and return a JSON url if it exists' do
    Sketch.url_for( 'foggy_winter_day' ).should ==( "/sketches/foggy_winter_day.json" )
    Sketch.url_for( nil ).should ==( "" )
    Sketch.url_for( 'never_going_to_exist_thank_you_very_much_not' ).should ==( "" )
  end

  specify 'should accept a sketch name and data and save it to a file' do
    original_data_file = File.join( SiteConfig.root, 'doc', 'foggy_winter_day.sample.json' )
    destination_data_file = File.join( SiteConfig.root, 'public', 'sketches', 'never_going_to_exist_thank_you_very_much_not.json' )
    Sketch.create( { :name => "never_going_to_exist_thank_you_very_much_not", :data => File.new( original_data_file ).readlines.join( '' ) } )
    Sketch.find_all.should include( 'never_going_to_exist_thank_you_very_much_not' )
    File.delete( destination_data_file ).should ==( 1 )
  end

end
