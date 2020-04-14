# JBrowse plugin for VCF file visualization
 JBrowse plugin to visualize VCF file content

## Installation
JBrowse dev version installation
```
# Jbrowse Git: https://github.com/GMOD/jbrowse/releases

# Download JBrowse 1.16.8
wget https://github.com/GMOD/jbrowse/archive/1.16.8-release.tar.gz
# Extract
tar xzf 1.16.8-release.tar.gz
# Rename
mv jbrowse-1.16.8-release jbrowse
```
My plugin install
```
cd plugins
git clone https://github.com/arpanda/vcfview.git
```
 #### load plugin on localhost
 ```
 http://localhost/jbrowse/jbrowse/?data=plugins/vcfview/test/data
 http://localhost/jbrowse/jbrowse/?data=test_vcfview

```
