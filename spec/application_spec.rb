require "#{File.dirname(__FILE__)}/spec_helper"

describe 'main application' do
  include Rack::Test::Methods

  def app
    Sinatra::Application.new
  end

  specify 'should show the default index page' do
    get '/'
    last_response.should be_ok
  end

  specify 'should list the existing sketches' do
    get '/'
#    last_response.body.should have_tag( 'li' ).with_tag( 'a', 'foggy_winter_day' )
  end

  specify 'should accept a new sketch and save it to a file' do
    original_data_file = File.join( SiteConfig.root, 'doc', 'foggy_winter_day.sample.json' )
    destination_data_file = File.join( SiteConfig.root, 'public', 'sketches', 'never_going_to_exist_thank_you_very_much_not.json' )
    post '/', { :sketch => { :name => "never_going_to_exist_thank_you_very_much_not", :data => File.new( original_data_file ).readlines.join( '' ) } }
    File.delete( destination_data_file ).should ==( 1 )
  end

end
