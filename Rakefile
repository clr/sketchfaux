require 'spec/rake/spectask'

task :default => :test
task :test => :spec

if !defined?(Spec)
  puts "spec targets require RSpec"
else
  desc "Run all examples"
  Spec::Rake::SpecTask.new('spec') do |t|
    t.spec_files = FileList['spec/**/*.rb']
    t.spec_opts = ['-cfs']
  end
end

namespace :db do
  desc 'Auto-migrate the database (destroys data)'
  task :migrate => :environment do
    DataMapper.auto_migrate!
  end

  desc 'Auto-upgrade the database (preserves data)'
  task :upgrade => :environment do
    DataMapper.auto_upgrade!
  end
end

namespace :gems do
  desc 'Install required gems'
  task :install do
    required_gems = %w{ sinatra rspec rack-test dm-core dm-validations
                        dm-aggregates haml }
    required_gems.each { |required_gem| system "sudo gem install #{required_gem}" }
  end
end

task :environment do
  require 'environment'
end

def javascript_files
  [
    'pepper',
    'event',
    'interface',
    'style',
    'player',
    'canvas'
  ].collect{ |f| f + '.js' }
end

def license
  return <<-LICENSE
/*
 * sketchfaux 0.4.71 - SketchFaux Drawing Canvas
 *
 * Copyright (c) 2009 Casey Rosenthal (github.net/clr)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: #{ Date.today } #{ Time.now } $
 * $Rev: 1 more than last time $
 */
 
LICENSE
end

namespace :javascript do

  desc "Concatenate the files together."
  task :join do
    all_scripts = license
    javascript_files.each do |file|
      all_scripts << File.read( File.join( 'javascript', 'lib', file ) )
    end
    File.open( File.join( 'public', 'javascript', 'sketchfaux.js' ), 'wb'){ |f| f.write( all_scripts ) }
  end

  desc "Minify the concatenated files."
  task :compress => :join do
    `./jsmin.rb <./public/javascript/sketchfaux.js >./public/javascript/sketchfaux.min.js`
  end

end

namespace :sketchfu do

  desc "Convert drawing files from XML to JSON."
  task :xml_to_json do
    gem 'libxml-ruby', '>= 0.8.3'
    require 'xml'
    Dir.glob( File.join( 'doc', '*.xml' ) ).each do |file|
      File.open( File.join( 'public', 'sketches', File.basename( file, '.xml' ) + '.json' ), 'wb') do |f|
        f.write( "{\"l\": [" );
        parser = XML::Parser.file( file )
        doc = parser.parse
        lines = doc.find( '//line' )
        lines.each_with_index do |line, i|
          f.write( "{" );
          f.write( "\"s\": {" );
          f.write( "\"c\": \"##{ line.attributes['c'].to_i.to_s( 16 ) }\", " );
          f.write( "\"o\": #{ line.attributes['o'].to_f / 100 }, " );
          f.write( "\"d\": #{ line.attributes['t'].to_i } " );
          f.write( "}, " );
          f.write( "\"p\": [" );
          points = line.find( 'p' )
          points.each_with_index do |point, j|
            f.write( "[#{ point.attributes['x'].to_f.round }, #{ point.attributes['y'].to_f.round }]#{ ( j + 1 ) == points.length ? '' : ', ' }" );
          end
          f.write( "]" );
          f.write( "}#{ ( i + 1 ) == lines.length ? '' : ', ' }" );
        end
        f.write( "]}" );
      end
    end
  end

end

begin
  require "vlad"
  Vlad.load(:app => nil, :scm => "git")
rescue LoadError
  # do nothing
end
