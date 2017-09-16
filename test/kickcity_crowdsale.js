const KickcityCrowdsale = artifacts.require('KickcityCrowdsale')
const KickcityToken = artifacts.require('KickcityToken')

let accounts;
let token;

async function createSale(startTime = 0, endTime = 0) {
    token = await KickcityToken.new();
    let tokenAddr = await token.address;
    let beneficiar = accounts[6];
    let controller =  await KickcityCrowdsale.new(startTime, endTime, tokenAddr, beneficiar);
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
        throw new Error("Function didn't throw");
    } catch (error) {
        let strError = error.toString();
        assert(strError.includes('invalid opcode') || strError.includes('invalid JUMP'), 
            "shoud be RPC error, but was: " + strError);
    }
}

contract('KickcityCrowdsale', function (_accounts) {
    before(function () {
        accounts = _accounts;
    });

    it("should create instance of controller with correct defaults", async () => {
        let sale = await createSale();
        let hCap = await sale.etherHardCap.call();
        assert.equal(hCap.toNumber(), web3.toWei(43100, "ether"))
    });

    it("should convert ether to kicks", async () => {
        let sale = await createSale();
        // 40% bonus
        let x1 = await sale.calcKicks.call(web3.toWei(1, "ether"));
        assert.equal(x1.toNumber(), web3.toWei(4200, "ether"));
        // 100% bonus
        let x2 = await sale.calcKicks.call(web3.toWei(150, "ether"));
        assert.equal(x2.toNumber(), web3.toWei(900000, "ether"));
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
            await sale.setHardCap(cap, {from: accounts[1]});
        });
    })

    it("can contribute, transfer to wallet, send tokens and update ether collected value", async () => {
        let sale = await createOnGoingSale();
        let price = web3.toWei(1, "ether")

        let startWalletBalance = await web3.eth.getBalance(accounts[6]);
        let startEtherCollected = await sale.etherCollected.call();
        
        await sale.sendTransaction({from: accounts[0], value: price})

        let userTokenBalance = await token.balanceOf.call(accounts[0]);
        let endWalletBalance = await web3.eth.getBalance(accounts[6]);
        let endEtherCollected = await sale.etherCollected.call();

        assert.equal(userTokenBalance.toNumber(), web3.toWei(4200, "ether"), "user didn't receive tokens");
        assert.equal(startWalletBalance.plus(price).toNumber(), endWalletBalance.toNumber(), "wallet didn't receive ether");
        assert.equal(startEtherCollected.plus(price).toNumber(), endEtherCollected.toNumber(), "ether collected value didn't get updated properly");
    });

    it("cannot contribute to not-ongoing sale", async () => {
        let sale = await createSale();
        let price = web3.toWei(1, "ether");
        shouldThrow(async () => {
            await sale.sendTransaction({from: accounts[0], value: price});
        });
    })

    it("cannot contribute over hard cap", async() => {
        let sale = await createOnGoingSale();
        await sale.setHardCap(web3.toWei(2, "ether"));
        let price = web3.toWei(5, "ether");

        shouldThrow(async () => {
            await sale.sendTransaction({from: accounts[0], value: price});
        });
    });
});
