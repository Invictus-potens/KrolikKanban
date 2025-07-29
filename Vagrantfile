# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/focal64"
  config.vm.box_version = "20211026.0.0"
  
  config.vm.define "krolikkanban" do |krolikkanban|
    krolikkanban.vm.hostname = "krolikkanban"
    krolikkanban.vm.network "private_network", ip: "192.168.33.10"
    krolikkanban.vm.network "forwarded_port", guest: 80, host: 8080
    krolikkanban.vm.network "forwarded_port", guest: 443, host: 8443
    krolikkanban.vm.network "forwarded_port", guest: 3000, host: 3000
    
    krolikkanban.vm.provider "virtualbox" do |vb|
      vb.name = "KrolikKanban"
      vb.memory = "2048"
      vb.cpus = "2"
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
    end
    
    krolikkanban.vm.provider "vmware_desktop" do |vmware|
      vmware.vmx["memsize"] = "2048"
      vmware.vmx["numvcpus"] = "2"
    end
    
    krolikkanban.vm.provider "libvirt" do |libvirt|
      libvirt.memory = 2048
      libvirt.cpus = 2
    end
    
    krolikkanban.vm.synced_folder ".", "/vagrant", disabled: true
    
    krolikkanban.vm.provision "shell", inline: <<-SHELL
      # Update system
      apt-get update
      apt-get install -y curl git software-properties-common apt-transport-https ca-certificates gnupg lsb-release
      
      # Install Docker
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
      add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
      apt-get update
      apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
      
      # Create application user
      useradd -m -s /bin/bash krolikkanban
      usermod -aG docker krolikkanban
      
      # Create application directory
      mkdir -p /var/www/krolikkanban
      chown krolikkanban:krolikkanban /var/www/krolikkanban
      
      # Copy application files
      cp /vagrant/Dockerfile /var/www/krolikkanban/
      cp /vagrant/docker-compose.yml /var/www/krolikkanban/
      cp /vagrant/nginx.conf /var/www/krolikkanban/
      cp /vagrant/package.json /var/www/krolikkanban/
      cp /vagrant/next.config.ts /var/www/krolikkanban/
      cp /vagrant/tsconfig.json /var/www/krolikkanban/
      cp /vagrant/tailwind.config.js /var/www/krolikkanban/
      cp /vagrant/postcss.config.mjs /var/www/krolikkanban/
      cp /vagrant/eslint.config.mjs /var/www/krolikkanban/
      
      # Copy application source
      cp -r /vagrant/app /var/www/krolikkanban/
      cp -r /vagrant/components /var/www/krolikkanban/
      cp -r /vagrant/lib /var/www/krolikkanban/
      
      # Set permissions
      chown -R krolikkanban:krolikkanban /var/www/krolikkanban
      
      # Create environment file
      cat > /var/www/krolikkanban/.env << 'EOF'
      NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
      NODE_ENV=production
      NEXT_TELEMETRY_DISABLED=1
      EOF
      
      chown krolikkanban:krolikkanban /var/www/krolikkanban/.env
      chmod 600 /var/www/krolikkanban/.env
      
      # Start application
      cd /var/www/krolikkanban
      sudo -u krolikkanban docker-compose up -d
      
      echo "KrolikKanban is now running at http://192.168.33.10"
    SHELL
  end
end