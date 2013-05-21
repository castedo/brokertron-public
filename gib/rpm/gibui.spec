Summary:   Brokertron Gateway for IB User Interface
Name:      gibui 
Version:   3.1
Release:   0
BuildArch: noarch
License:   Copyfree
Vendor:    Castedo Ellerman LLC
URL:       http://github.com/castedo/brokertron-public
Requires:  gib
Packager:  Castedo Ellerman <castedo@castedo.com>
Prefix:    /usr/share
Source0:   %(echo $RPM_SOURCE_DIR)

%description
Installs HTML, CSS, JavaScript, image and related files to provide the front-end user interface
for Brokertorn Gateway for IB.

%prep
rm -rf $RPM_BUILD_ROOT
mkdir -p $RPM_BUILD_ROOT/usr/share/gib/ui/default
cp -r %{SOURCEURL0}/* $RPM_BUILD_ROOT/usr/share/gib/ui/default/

%clean
rm -r "$RPM_BUILD_ROOT"

%files
%defattr(-,root,root,-)
"/usr/share/gib/ui/*"


%changelog
* Fri Feb 8 2013 Castedo Ellerman <castedo@castedo.com>
  Thank you stackoverflow.com.

