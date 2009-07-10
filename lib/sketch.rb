class Sketch

  def self.find_all
    return Dir.glob( File.join( SiteConfig.root, 'public', 'sketches', '*.json' ) ).collect do |file_name|
      File.basename( file_name, '.json' )
    end
  end
  
  def self.url_for( sketch )
    if !sketch.nil? && File.exists?( File.join( SiteConfig.root, 'public', 'sketches', sketch + '.json' ) )
      return "/sketches/#{ sketch }.json"
    else
      return ""
    end
  end
  
  def self.create( attributes )
    if( attributes && attributes[:data] && attributes[:name] )
      destination_data_file = File.join( SiteConfig.root, 'public', 'sketches', attributes[:name].gsub(/\s+/, '_').downcase + '.json' )
      File.open( destination_data_file, 'wb') do |f|
        f.write( attributes[:data] )
      end
      return File.exists?( destination_data_file )
    else
      raise "Missing parameters sent to create a sketch."
    end
  end

end
