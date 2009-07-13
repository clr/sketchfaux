require 'base64'

class Sketch

  def self.find_all
    return Dir.glob( File.join( SiteConfig.root, 'public', 'sketches', '*.json' ) ).collect do |file_name|
      File.basename( file_name, '.json' )
    end.sort do |a, b|
      File.atime( File.join( SiteConfig.root, 'public', 'sketches', a + '.json' ) ) <=> File.atime( File.join( SiteConfig.root, 'public', 'sketches', a + '.json' ) )
    end.reverse
  end
  
  def self.url_for( sketch )
    if !sketch.nil? && File.exists?( File.join( SiteConfig.root, 'public', 'sketches', sketch + '.json' ) )
      return "/sketches/#{ sketch }.json"
    else
      return ""
    end
  end
  
  def self.thumbnail_for( sketch )
    if !sketch.nil? && File.exists?( File.join( SiteConfig.root, 'public', 'thumbnails', sketch + '.png' ) )
      return "/thumbnails/#{ sketch }.png"
    else
      return nil
    end
  end
  
  def self.create( attributes )
    if( attributes && attributes[:data] && attributes[:name] )
      file_name = attributes[:name].gsub(/\s+/, '_').downcase
      destination_data_file = File.join( SiteConfig.root, 'public', 'sketches', file_name + '.json' )
      File.open( destination_data_file, 'wb') do |f|
        f.write( attributes[:data] )
      end
      if( attributes[:thumbnail] )
        return self.save_thumbnail( file_name, attributes[:thumbnail] )
      else
        return File.exists?( destination_data_file )
      end
    else
      raise "Missing parameters sent to create a sketch."
    end
  end
  
  def self.save_thumbnail( file_name, base64_data )
    destination_image_file = File.join( SiteConfig.root, 'public', 'thumbnails', file_name + '.png' )
    File.open( destination_image_file, 'wb' ) do |f|
      f.write( Base64.decode64( base64_data ) )
    end
    return File.exists?( destination_image_file )
  end

end
