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
      port: 8546,
      network_id: "*"
    },
    live: {
      host: "localhost",
      port: 8547,
      network_id: 1,
      gasPrice: 40000000000
    }
  }
};
