const KICK = artifacts.require("KickcityToken");

let instance;

contract('KickcityToken', function (accounts) {
    before(async () => {
        instance = await KICK.deployed();
    });
    it("verifies token parameters", async () => {
        let name = await instance.name.call();
        let symbol = await instance.symbol.call();
        let decimals = await instance.decimals.call();

        assert.equal(name, "Kickcity Token");
        assert.equal(symbol, "KICK");
        assert.equal(decimals, 18);
    });
    it("should have 0 tokens initially", async () => {
        let balance = await instance.totalSupply.call();
        assert.equal(balance.valueOf(), 0, "has some tokens");
    });
    it("should issue token correctly", async () => {
        await instance.issue(accounts[1], 100);
        let totalSupply = await instance.totalSupply.call();
        assert.equal(totalSupply, 100);
        let balance = await instance.balanceOf.call(accounts[1]);
        assert.equal(balance, 100);
    });
    it("should send token correctly", async () => {
        var account_one = accounts[1];
        var account_two = accounts[4];

        var account_one_starting_balance;
        var account_two_starting_balance;
        var account_one_ending_balance;
        var account_two_ending_balance;

        var amount = 10;

        account_one_starting_balance = await instance.balanceOf.call(account_one);
        account_two_starting_balance = await instance.balanceOf.call(account_two);
        await instance.transfer(account_two, amount, { from: account_one });
        account_one_ending_balance = await instance.balanceOf.call(account_one);
        account_two_ending_balance = await instance.balanceOf.call(account_two);

        assert.equal(account_one_ending_balance.toNumber(), account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
        assert.equal(account_two_ending_balance.toNumber(), account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
});
