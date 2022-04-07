function readPackage(pkg) {
  ["react", "react-dom"].forEach((name) => {
    if (pkg.peerDependencies[name]) {
      pkg.peerDependencies[name] = "^18.0.0";
    }
  });

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
