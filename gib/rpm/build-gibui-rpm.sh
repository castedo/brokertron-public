# make sure .rpmmacros exists so that RPMs are built within user's filesystem
if [ ! -e ~/.rpmmacros ]
then
    echo %_topdir ~/rpmbuild > ~/.rpmmacros
    mkdir -p ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
fi

# define RPM_SOURE_DIR to point to directory of UI files
export RPM_SOURCE_DIR="$( cd "$(dirname "$0")/../ui" && pwd )"
rpmbuild -v -bb gibui.spec

