# # to get livereload working from outside localhost
# curhost = 'server ip address'
# set :host, curhost
# activate :livereload, :host => curhost
activate :livereload

set :css_dir, 'stylesheets'

set :js_dir, 'javascripts'

set :images_dir, 'images'

configure :build do
  # Use relative URLs
  activate :relative_assets
  activate :cache_buster
  set :build_dir, './'
end