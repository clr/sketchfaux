require 'rubygems'
require 'sinatra'
require 'environment'

configure do
  set :views, "#{File.dirname(__FILE__)}/views"
end

error do
  e = request.env['sinatra.error']
  Kernel.puts e.backtrace.join("\n")
  'Application error'
end

helpers do
end

# root page
get '/' do
  haml :index
end

post '/' do
  if( params[:sketch] && params[:sketch][:data] && params[:sketch][:name] )
    Sketch.create( params[:sketch] )
    redirect '/'
  end
end
