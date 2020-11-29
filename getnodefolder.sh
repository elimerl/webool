tar_url=$(npm view @types/node dist.tarball)
wget $tar_url -O node-types.tgz
tar xf node-types.tgz
rm node-types.tgz