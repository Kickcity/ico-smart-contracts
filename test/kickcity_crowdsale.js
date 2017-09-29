const KickcityPresale = artifacts.require('KickcityPresale')
const KickcityCrowdsale = artifacts.require('KickcityCrowdsale')
const KickcityToken = artifacts.require('KickcityToken')

let accounts;
let token;

async function createSale(startTime = 0, endTime = 1) {
    token = await KickcityToken.new();
    let tokenAddr = await token.address;
    let beneficiar = accounts[6];
    let controller = await KickcityCrowdsale.new(startTime, endTime, tokenAddr, beneficiar);
    await token.transferOwnership(controller.address);
    await controller.acceptTokenOwnership();
    return controller;
}

async function createPresale(startTime = 0, endTime = 1) {
    token = await KickcityToken.new();
    let tokenAddr = await token.address;
    let beneficiar = accounts[6];
    let controller = await KickcityPresale.new(startTime, endTime, tokenAddr, beneficiar);
    await token.transferOwnership(controller.address);
    await controller.acceptTokenOwnership();
    return controller;
}

let today = new Date();

function addDays(date, days) {
    let copy = new Date(date);
    copy.setDate(date.getDate() + days);
    return copy;
}

async function createOnGoingSale() {
    return await createSale(addDays(today, -5).getTime() / 1000, addDays(today, +5).getTime() / 1000);
}

async function shouldThrow(f) {
    try {
        await f();
        assert(false, "didn't throw");
    } catch (error) {
        let strError = error.toString();
        assert(strError.includes('invalid opcode') || strError.includes('invalid JUMP'),
            "shoud be RPC error, but was: " + strError);
    }
}

contract('KickcitySale', function (_accounts) {
    before(function () {
        accounts = _accounts;
    });

    it("should create instance of controller with correct defaults", async () => {
        let sale = await createSale();
        let hCap = await sale.etherHardCap.call();
        assert.equal(hCap.toNumber(), web3.toWei(43100, "ether"))
    });

    it("cannot create sale with incorrenct values", async () => {
        await shouldThrow(async () => {
            let sale = await createSale(100, 50)
        });
        await shouldThrow(async () => {
            let sale = await KickcityPresale.new(50, 100, 0, 0);
        });
    });

    it("should convert ether to kicks", async () => {
        let sale = await createPresale();
        // 40% bonus
        let x1 = await sale.calcKicks.call(web3.toWei(1, "ether"));
        assert.equal(x1.toNumber(), web3.toWei(4200, "ether"));
        // 100% bonus
        let x2 = await sale.calcKicks.call(web3.toWei(150, "ether"));
        assert.equal(x2.toNumber(), web3.toWei(900000, "ether"));

        let csale = await createOnGoingSale();
        let x3 = await csale.calcKicks.call(web3.toWei(1, "ether"));
        assert.equal(x3.toNumber(), web3.toWei(3000, "ether"));

        let newsale = await createSale(today.getTime() / 1000, addDays(today, +5).getTime() / 1000);
        let x4 = await newsale.calcKicks.call(web3.toWei(1, "ether"));
        assert.equal(x4.toNumber(), web3.toWei(4200, "ether"));
    });

    it("can set ether hard cap", async () => {
        let sale = await createSale();
        let cap = web3.toWei(50000, "ether")
        await sale.setHardCap(cap);
        let newCap = await sale.etherHardCap.call();
        assert.equal(cap, newCap.toNumber(), "hardcap not changed");
    });

    it("non-owner cannot set hard cap", async () => {
        let sale = await createSale();
        let cap = web3.toWei(5000, "ether")
        await shouldThrow(async () => {
            await sale.setHardCap(cap, { from: accounts[1] });
        });
    })

    it("can contribute, transfer to wallet, send tokens and update ether collected value", async () => {
        let sale = await createOnGoingSale();
        let price = web3.toWei(1, "ether")

        let startWalletBalance = await web3.eth.getBalance(accounts[6]);
        let startEtherCollected = await sale.etherCollected.call();

        await sale.sendTransaction({ from: accounts[0], value: price })

        let userTokenBalance = await token.balanceOf.call(accounts[0]);
        let endWalletBalance = await web3.eth.getBalance(accounts[6]);
        let endEtherCollected = await sale.etherCollected.call();

        assert.equal(userTokenBalance.toNumber(), web3.toWei(3000, "ether"), "user didn't receive tokens");
        assert.equal(startWalletBalance.plus(price).toNumber(), endWalletBalance.toNumber(), "wallet didn't receive ether");
        assert.equal(startEtherCollected.plus(price).toNumber(), endEtherCollected.toNumber(), "ether collected value didn't get updated properly");
    });

    it("cannot contribute to not-ongoing sale", async () => {
        let sale = await createSale();
        let price = web3.toWei(1, "ether");
        shouldThrow(async () => {
            await sale.sendTransaction({ from: accounts[0], value: price });
        });
    })

    it("cannot contribute with bad gas price", async () => {
        let sale = await createOnGoingSale();
        let price = web3.toWei(1, "ether");
        shouldThrow(async () => {
            await sale.sendTransaction({
                from: accounts[0],
                value: price,
                gasPrice: 60000000000
            });
        });
    });

    it("cannot contribute over hard cap", async () => {
        let sale = await createOnGoingSale();
        let hardCap = web3.toWei(1, "ether")
        await sale.setHardCap(hardCap);
        let price = web3.toWei(5, "ether");

        let startWalletBalance = await web3.eth.getBalance(accounts[6]);
        let startEtherCollected = await sale.etherCollected.call();

        await sale.sendTransaction({ from: accounts[0], value: price });

        let userTokenBalance = await token.balanceOf.call(accounts[0]);
        let endWalletBalance = await web3.eth.getBalance(accounts[6]);
        let endEtherCollected = await sale.etherCollected.call();

        assert.equal(userTokenBalance.toNumber(), web3.toWei(3000, "ether"), "user didn't receive tokens");
        // Validate we received only 1 ether from user
        assert.equal(startWalletBalance.plus(hardCap).toNumber(), endWalletBalance.toNumber(), "wallet didn't receive ether");
        assert.equal(startEtherCollected.plus(hardCap).toNumber(), endEtherCollected.toNumber(), "ether collected value didn't get updated properly");
    });

    it("can report collected funds", async() => {
        let sale = await createOnGoingSale();
        let price = web3.toWei(1, "ether");

        await sale.sendTransaction({ from: accounts[0], value: price });

        let etherCollected = await sale.etherCollected.call();
        let usdCollected = await sale.usdCollected.call();

        assert.equal(etherCollected.toNumber(), price, "etherCollected is incorrect");
        assert.equal(usdCollected.toNumber(), 300, "usdCollected is incorrect");
    });
});
