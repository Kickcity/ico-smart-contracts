module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gasPrice: 20000000000
    },
    staging: {
      host: "localhost",
      port: 8545,
      network_id: 3,
      gasPrice: 10000000000,
      gas: 3141590
    },
    live: {
      host: "localhost",
      port: 8546,
      network_id: 1,
      gasPrice: 30000000000,
      gas: 3141590
    }
  }
};
