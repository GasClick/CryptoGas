import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("gasClickICO.2.Coins.test", function () {
	//const hre = require("hardhat");

	let GasClickICO, ico: Contract;
	let DemoToken, token: Contract;
	let owner: SignerWithAddress, project: SignerWithAddress, liquidity: SignerWithAddress;
	let addr1: SignerWithAddress, addr2: SignerWithAddress, addr3: SignerWithAddress, addrs;

	let ERRW_OWNR_NOT: string = 'ERRW_OWNR_NOT' // Ownable: caller is not the owner
	let ERRP_INDX_PAY: string = 'ERRP_INDX_PAY' // Wrong index
	let ERRD_MUST_ONG: string = 'ERRD_MUST_ONG' // ICO must be ongoing
	let ERRD_MUSN_BLK: string = 'ERRD_MUSN_BLK' // must not be blacklisted
	let ERRD_TRAS_LOW: string = 'ERRD_TRAS_LOW' // transfer amount too low
	let ERRD_TRAS_HIG: string = 'ERRD_TRAS_HIG' // transfer amount too high
	let ERRD_MUST_WHI: string = 'ERRD_MUST_WHI' // must be whitelisted
	let ERRD_INVT_HIG: string = 'ERRD_INVT_HIG' // total invested amount too high
	let ERRD_HARD_CAP: string = 'ERRD_HARD_CAP' // amount higher than available
	let ERRD_ALLO_LOW: string = 'ERRD_ALLO_LOW' // insuffient allowance
	let ERRR_MUST_FIN: string = 'ERRR_MUST_FIN' // ICO must be finished
	let ERRR_PASS_SOF: string = 'ERRR_PASS_SOF' // Passed SoftCap. No refund
	let ERRR_ZERO_REF: string = 'ERRR_ZERO_REF' // Nothing to refund
	let ERRR_WITH_REF: string = 'ERRR_WITH_REF' // Unable to refund
	let ERRC_MUST_FIN: string = 'ERRC_MUST_FIN' // ICO must be finished
	let ERRC_NPAS_SOF: string = 'ERRC_NPAS_SOF' // Not passed SoftCap
	let ERRC_MISS_TOK: string = 'ERRC_MISS_TOK' // Provide Token
	let ERRW_MUST_FIN: string = 'ERRW_MUST_FIN' // ICO must be finished
	let ERRW_NPAS_SOF: string = 'ERRW_NPAS_SOF' // Not passed SoftCap
	let ERRW_MISS_WAL: string = 'ERRW_MISS_WAL' // Provide Wallet
	let ERRR_ZERO_WIT: string = 'ERRR_ZERO_WIT' // Nothing to withdraw
	let ERRR_WITH_BAD: string = 'ERRR_WITH_BAD' // Unable to withdraw

	/********************************************************************************************************/
	/************************************************** hooks ***********************************************/
	/********************************************************************************************************/
	before(async() => {
		console.log('-------- Starting Tests -------');
		GasClickICO = await ethers.getContractFactory("GasClickICO");
		ico = await GasClickICO.deploy();
		await ico.deployed();
		await ico.setPaymentToken("COIN", ico.address, "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", Math.floor(1100*1e6), 18);
		console.log("deployed ICO:" + ico.address);

		DemoToken = await ethers.getContractFactory("DemoToken");
		token = await DemoToken.deploy();
		await token.deployed();
		console.log("deployed Token:" + token.address);

		[owner, project, liquidity, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
		[owner, project, liquidity, addr1, addr2, addr3, ...addrs].forEach(async(account, i) => {
			let balance = await ethers.provider.getBalance(account.address);
			console.log('%d - address: %s ; balance: %s', ++i, account.address, balance);
		});

		// uncomment to get real exchange values
		/*let usdPerEther = async () => {
			return fetch("https://api.coinbase.com/v2/exchange-rates?currency=ETH", { method: "GET", redirect: "follow" })
				.then((response) => response.json())
				.then((result) => {return(result.data.rates.USD)})
				.catch((error) => {return(error)});
		}
		numUsdPerEther = await usdPerEther()*/
		console.log('numUsdPerEther: ' + numUsdPerEther);

	});

	beforeEach(async() => {
		//console.log('--------------------');
		//await hre.network.provider.send("hardhat_reset")
	});

	afterEach(async() => {
		await logStatus();
		console.log('--------------------');
	});
	
	after(async() => {
		console.log('--------- Ending Tests --------');
	});

	/********************************************************************************************************/
	/********************************************* supporting functions *************************************/
	/********************************************************************************************************/
	// currency conversions
	let numUsdPerEther: number = 1100;

	let etherToUsd = function (ether: number) {
		return ether * numUsdPerEther;
	}
	let usdToEther = function (usd: number) {
		return usd / numUsdPerEther;
	}
	let weiToUsd = function (wei: BigNumber) {
		return etherToUsd(Number(ethers.utils.formatEther(wei)));
	}
	let usdToWei = function (usd: number) {
		return ethers.utils.parseUnits((usdToEther(usd).toString()), 18);
	}
	let stringToBytes5 = function (str: string) {
		return ethers.utils.hexZeroPad(ethers.utils.toUtf8Bytes(str), 5);
	}
	let bytes5ToString = function (hexString: string) {
		return ethers.utils.toUtf8String(hexString);
	}

	it("Initial Logs.", async() => {

		//console.log("\tgetMaxTransfer: " + weiToUsd(await ico.getMaxTransfer()) + " USD");
		//console.log("\tgetMinTransfer: " + weiToUsd(await ico.getMinTransfer()) + " USD");
		//console.log("\tgetMaxInvestment: " + weiToUsd(await ico.getMaxInvestment()) + " USD");
		//console.log("\tgetHardCap: " + weiToUsd(await ico.getHardCap()) + " USD")

		console.log("\n");
		console.log("Addresses:");
		console.log("\towner address: " + owner.address);
		console.log("\tico address: " + ico.address);
		console.log("\tico owner address: " + await ico.owner());
		console.log("\ttoken address: " + token.address);
		console.log("\ttoken owner address: " + await token.owner());
		console.log("\ttoken owner balance: " + await token.balanceOf(await token.owner()));
		console.log("\tproject address: " + project.address);
		console.log("\tliquidity address: " + liquidity.address);
		console.log("\n");

	});

	it("Should do number conversions.", async() => {

		console.log("usd to wei to usd: " + weiToUsd(usdToWei(10)));
		console.log("usd to eher to usd: " + etherToUsd(usdToEther(10)));

	});

	// transfer helper
	let testTransferCoin = async (addr: SignerWithAddress, usdAmount: number) => {
		console.log("purchase of : " + usdAmount + " USD = " + usdToWei(usdAmount) + " Wei by " + addr.address);
		return await addr.sendTransaction({
			to: ico.address,
			value: usdToWei(usdAmount),
			gasPrice: '0x5b9aca00',
			gasLimit: '0x56f90',
		});
	};

	let logStatus = async () => {

		console.log("\getTotaluUSDInvested: " + await ico.getTotaluUSDInvested() + " USD");

		let price = await ico.getPriceuUSD();

		let investorsCount = await ico.getInvestorsCount();
		let investors = await ico.getInvestors();
		console.log("\tInvestors: ");
		for (let i = 0; i < investorsCount; i++) {
			let ether = await ethers.provider.getBalance(investors[i]);
			let uusd = await ico.getuUSDToClaim(investors[i]);
			let tokens = Math.floor(uusd / price);
			console.log("\t\t* " + investors[i] + " ether: " + weiToUsd(ether) + " USD" + "; tokens: " + tokens + " CYGAS = " + (uusd/10**6) + " USD");
		}

	}

	/********************************************************************************************************/
	/****************************************** Payment Tokens **********************************************/
	/********************************************************************************************************/
	it("Should update PaymentTokens", async() => {

		await ico.setCrowdsaleStage(1);

		await expect(testTransferCoin(addr1, 10)).not.to.be.reverted;
		expect((await ico.getPaymentToken("COIN"))[4]).to.equal(1 * 9999999, 'Invested amount must be accounted');																	// uUSDInvested
		expect((await ico.getPaymentToken("COIN"))[5]).to.equal(BigInt(1 * 9090909090909090), 'Invested amount must be accounted');								// amountInvested			

		await expect(testTransferCoin(addr2, 10)).not.to.be.reverted;
		expect((await ico.getPaymentToken("COIN"))[4]).to.equal(2 * 9999999, 'Invested amount must be accounted');																	// uUSDInvested
		expect((await ico.getPaymentToken("COIN"))[5]).to.equal(BigInt((2 * 9090909090909090).toString()), 'Invested amount must be accounted');		// amountInvested

		await expect(testTransferCoin(addr3, 10)).not.to.be.reverted;
		expect((await ico.getPaymentToken("COIN"))[4]).to.equal(3 * 9999999, 'Invested amount must be accounted');																	// uUSDInvested
		expect((await ico.getPaymentToken("COIN"))[5]).to.equal(BigInt((3 * 9090909090909090).toString()), 'Invested amount must be accounted');		// amountInvested
	});

	/********************************************************************************************************/
	/********************************************** Investors ***********************************************/
	/********************************************************************************************************/
	it("Should count investors", async() => {

		await ico.setCrowdsaleStage(1);

		await expect(testTransferCoin(addr1, 10)).not.to.be.reverted;
		await expect(testTransferCoin(addr2, 10)).not.to.be.reverted;
		await expect(testTransferCoin(addr3, 10)).not.to.be.reverted;

		let investorsCount = await ico.getInvestorsCount();
		expect(investorsCount).to.equal(3, 'Investors not counted correctly');
		let investors = await ico.getInvestors();
		for (let i = 0; i < investorsCount; i++) {
			let uusdContributedBy = await ico.getuUSDToClaim(investors[i]);
			console.log('usdContributedBy ' + uusdContributedBy);
			expect(uusdContributedBy).to.equal(19999998, 'Investor USD contributed is wrong');
			//expect(uusdContributedBy).to.be.closeTo(BigNumber.from(10000000),'Investor USD contributed is wrong');
		}

		expect(await ico.getuUSDToClaim(addr1.address)).to.equal(19999998, 'Investor USD contributed is wrong');
		expect(await ico.getuUSDToClaim(addr2.address)).to.equal(19999998, 'Investor USD contributed is wrong');
		expect(await ico.getuUSDToClaim(addr3.address)).to.equal(19999998, 'Investor USD contributed is wrong');
	});

	/********************************************************************************************************/
	/************************************************ Deposit ***********************************************/
	/********************************************************************************************************/
	// normal
	it("Should be able to deposit only if Ongoing", async() => {
		await ico.setCrowdsaleStage(1);
		await expect(await testTransferCoin(addr1, 10))
			.to.changeEtherBalances([ico, addr1], [usdToWei(10), usdToWei(-10)]);

		await ico.setCrowdsaleStage(0);
		await expect(testTransferCoin(addr1, 10)).to.be.revertedWith(ERRD_MUST_ONG);

		await ico.setCrowdsaleStage(2);
		await expect(testTransferCoin(addr1, 10)).to.be.revertedWith(ERRD_MUST_ONG);

		await ico.setCrowdsaleStage(3);
		await expect(testTransferCoin(addr1, 10)).to.be.revertedWith(ERRD_MUST_ONG);
	});

	it("Should be able to whitelist and unwhitelist", async() => {
		await ico.setCrowdsaleStage(1);

		// whitelisting enabled, small transfer
		console.log("getuUSDToClaim: " + await ico.getuUSDToClaim(addr1.address));
		await ico.setWhitelistuUSDThreshold(30 * 10**6);
		await ico.unwhitelistUser(addr1.address);
		await expect(testTransferCoin(addr1, 21)).to.be.revertedWith(ERRD_MUST_WHI);
		await ico.whitelistUser(addr1.address);
		await expect(testTransferCoin(addr1, 21)).not.to.be.reverted;

		await ico.setWhitelistuUSDThreshold(10 * 10**12);
	});

	it("Should be able to blacklist and unblacklist", async() => {
		await ico.setCrowdsaleStage(1);

		await ico.setUseBlacklist(false);
		await ico.blacklistUser(addr1.address);
		await expect(testTransferCoin(addr1, 10)).not.to.be.reverted;

		await ico.setUseBlacklist(true);
		await ico.blacklistUser(addr1.address);
		await expect(testTransferCoin(addr1, 10)).to.be.revertedWith(ERRD_MUSN_BLK);

		await ico.setUseBlacklist(true);
		await ico.unblacklistUser(addr1.address);
		await expect(testTransferCoin(addr1, 10)).not.to.be.reverted;

		await ico.setUseBlacklist(false);
	});

	// min transfer
	it("Should respect transfer limits", async() => {
		await ico.setCrowdsaleStage(1);
		console.log("Testing Transfer Limits");

		await ico.setMinuUSDTransfer(9.9999 * 10**6);
		await expect(testTransferCoin(addr1, 9)).to.be.revertedWith(ERRD_TRAS_LOW);
		await expect(testTransferCoin(addr1, 10)).not.to.be.reverted;
		await ico.setMinuUSDTransfer(9.99 * 10**6);
		console.log("Min Transfer is ok");

		await ico.setMaxuUSDTransfer(20.0001 * 10**6);
		await expect(testTransferCoin(addr1, 21)).to.be.revertedWith(ERRD_TRAS_HIG);
		await expect(testTransferCoin(addr1, 20)).not.to.be.reverted;
		await ico.setMaxuUSDTransfer(10_000.001  * 10**6);
		console.log("Max Transfer is ok");

		console.log("getuUSDToClaim: " + await ico.getuUSDToClaim(addr1.address));
		await ico.setMaxuUSDInvestment(130 * 10**6);
		await expect(testTransferCoin(addr1, 11)).not.to.be.reverted;
		await expect(testTransferCoin(addr1, 11)).not.to.be.reverted;
		await expect(testTransferCoin(addr1, 40)).to.be.revertedWith(ERRD_INVT_HIG);
		await ico.setMaxuUSDInvestment(10_001 * 10**6);
		console.log("Max Investment is ok");
	});

	// beyond hard cap
	it("Should not be able to deposit beyond caps", async() => {
		await ico.setCrowdsaleStage(1);

		await ico.setMaxuUSDTransfer(20_000_000 * 10**6);
		await ico.setMaxuUSDInvestment(140_000_000 * 10**6);
		await expect(testTransferCoin(addr1, 200_000)).to.be.revertedWith(ERRD_HARD_CAP);
		await ico.setMaxuUSDTransfer(10_000 * 10**6);
		await ico.setMaxuUSDInvestment(10_000 * 10**6);
	});

	it("Should updat ICO balance", async() => {
		await expect(testTransferCoin(addr1, 10)).not.to.be.reverted;
		await expect(testTransferCoin(addr2, 10)).not.to.be.reverted;
		await expect(testTransferCoin(addr3, 10)).not.to.be.reverted;

		let contributed1 = await ico.getContribution(addr1.address, "COIN");
		let contributed2 = await ico.getContribution(addr2.address, "COIN");
		let contributed3 = await ico.getContribution(addr3.address, "COIN");
		let totalContributed = contributed1.add(contributed2).add(contributed3);
		let balanceOfICO = await ethers.provider.getBalance(ico.address);
		console.log("balance " + balanceOfICO);
		expect(balanceOfICO).to.equal(totalContributed);
	});

	/********************************************************************************************************/
	/************************************************** Refund **********************************************/
	/********************************************************************************************************/
	it("Should be able to refund Coins to investor", async() => {

		await ico.setCrowdsaleStage(1);

		await expect(testTransferCoin(addr1, 10)).not.to.be.reverted;
		await expect(testTransferCoin(addr2, 10)).not.to.be.reverted;
		await expect(testTransferCoin(addr3, 10)).not.to.be.reverted;

		await ico.setCrowdsaleStage(3);

		let balanceOfICO3 = await ethers.provider.getBalance(ico.address);
		console.log("balanceOfICO3: " + balanceOfICO3);

		let contributed1 = await ico.getContribution(addr1.address, "COIN");
		await expect(await ico.connect(addr1).refund())
			.to.changeEtherBalances([ico, addr1], [contributed1.mul(-1), contributed1]);
		contributed1 = await ico.getContribution(addr1.address, "COIN");
		expect(contributed1).to.equal(0);

		let contributed2 = await ico.getContribution(addr2.address, "COIN");
		await expect(await ico.connect(addr2).refund())
			.to.changeEtherBalances([ico, addr2], [contributed2.mul(-1), contributed2]);
		contributed2 = await ico.getContribution(addr2.address, "COIN");
		expect(contributed2).to.equal(0);

		let contributed3 = await ico.getContribution(addr3.address, "COIN");
		await expect(await ico.connect(addr3).refund())
			.to.changeEtherBalances([ico, addr3], [contributed3.mul(-1), contributed3]);
		contributed3 = await ico.getContribution(addr3.address, "COIN");
		expect(contributed3).to.equal(0);

		expect(await ethers.provider.getBalance(ico.address)).to.equal(0);
	});

	it("Should be able to refund all Coins", async() => {

		await ico.setCrowdsaleStage(1);

		await expect(testTransferCoin(addr1, 10)).not.to.be.reverted;
		await expect(testTransferCoin(addr2, 10)).not.to.be.reverted;
		await expect(testTransferCoin(addr3, 10)).not.to.be.reverted;

		await ico.setCrowdsaleStage(3);

		let contributed1 = await ico.getContribution(addr1.address, "COIN");
		let contributed2 = await ico.getContribution(addr2.address, "COIN");
		let contributed3 = await ico.getContribution(addr3.address, "COIN");
		let totalContributed = contributed1.add(contributed2).add(contributed3);

		await expect(await ico.refundAll())
			.to.changeEtherBalances([ico, addr1, addr2, addr3], [totalContributed.mul(-1), contributed1, contributed2, contributed3]);

		expect(await ethers.provider.getBalance(ico.address)).to.equal(0);
	});

	/********************************************************************************************************/
	/*********************************************** Withdraw ***********************************************/
	/********************************************************************************************************/
	it("Should be able to Withdraw Coins", async() => {

		await ico.setCrowdsaleStage(1);

		await ico.setMaxuUSDTransfer(20_000_000 * 10**6);
		await ico.setMaxuUSDInvestment(140_000_000 * 10**6);

		await ico.setTargetWalletAddress(liquidity.address);

		await expect(testTransferCoin(addr1, 17000)).not.to.be.reverted;
		await expect(testTransferCoin(addr2, 17000)).not.to.be.reverted;
		await expect(testTransferCoin(addr3, 17000)).not.to.be.reverted;

		await ico.setCrowdsaleStage(3);

		// withdraw ether to wallets
		let balanceOfICO = await ethers.provider.getBalance(ico.address);
		await expect(await ico.withdraw("COIN", 100))
			.to.changeEtherBalances([ico, liquidity], [balanceOfICO.mul(-1), balanceOfICO]);
		expect(await ethers.provider.getBalance(ico.address)).to.equal(0);
		expect(await ethers.provider.getBalance(token.address)).to.equal(0);

		expect((await ico.getPaymentToken("COIN"))[4]).to.equal(0, 'Invested amount must be zero');		// uUSDInvested
		expect((await ico.getPaymentToken("COIN"))[5]).to.equal(0, 'Invested amount must be zero');		// amountInvested			
	});
		
	/********************************************************************************************************/
	/************************************************ Claim *************************************************/
	/********************************************************************************************************/
		it("Should be able to claim Coins", async() => {

		// prepare test
		await ico.setCrowdsaleStage(1);

		await ico.setTokenAddress(token.address);

		await expect(testTransferCoin(addr1, 10)).not.to.be.reverted;
		await expect(testTransferCoin(addr2, 10)).not.to.be.reverted;
		await expect(testTransferCoin(addr3, 10)).not.to.be.reverted;

		await ico.setCrowdsaleStage(3);

		let price: number = await ico.getPriceuUSD();
		console.log("price " + price);

		// claim tokens from investors 1
		let uUSDContributed1 = await ico.getuUSDToClaim(addr1.address);
		console.log("uUSDContributed1 " + uUSDContributed1);
		let numTokensWithDecimals1 = BigInt(uUSDContributed1) * BigInt(10**18) / BigInt(price);
		console.log("numTokensWithDecimals1 " + numTokensWithDecimals1);
		await token.approve(ico.address, numTokensWithDecimals1);
		await expect(() => ico.connect(addr1).claim())
			.to.changeTokenBalances(token, [owner, addr1], [BigInt(-1) * numTokensWithDecimals1, numTokensWithDecimals1]);
		expect(await ico.getuUSDToClaim(addr1.address)).to.equal(0);
		expect(await ico.getContribution(addr1.address, 'COIN')).to.equal(0);
		expect(await ico.getuUSDContribution(addr1.address, 'COIN')).to.equal(0);

		// claim tokens from investors 2
		let uUSDContributed2 = await ico.getuUSDToClaim(addr2.address);
		let numTokensWithDecimals2 = BigInt(uUSDContributed2) * BigInt(10**18) / BigInt(price);
		await token.approve(ico.address, numTokensWithDecimals2);
		await expect(() => ico.connect(addr2).claim())
			.to.changeTokenBalances(token, [owner, addr2], [BigInt(-1) * numTokensWithDecimals2, numTokensWithDecimals2]);
		expect(await ico.getuUSDToClaim(addr2.address)).to.equal(0);
		expect(await ico.getContribution(addr2.address, 'COIN')).to.equal(0);
		expect(await ico.getuUSDContribution(addr2.address, 'COIN')).to.equal(0);

		// claim tokens from investors 3
		let uUSDContributed3 = await ico.getuUSDToClaim(addr3.address);
		let numTokensWithDecimals3 = BigInt(uUSDContributed3) * BigInt(10**18) / BigInt(price);
		await token.approve(ico.address, numTokensWithDecimals3);
		await expect(() => ico.connect(addr3).claim())
			.to.changeTokenBalances(token, [owner, addr3], [BigInt(-1) * numTokensWithDecimals3, numTokensWithDecimals3]);
		expect(await ico.getuUSDToClaim(addr3.address)).to.equal(0);
		expect(await ico.getContribution(addr3.address, 'COIN')).to.equal(0);
		expect(await ico.getuUSDContribution(addr3.address, 'COIN')).to.equal(0);

	});

	it("Should be able to ClaimAll Coins", async() => {

		// prepare test
		await ico.setCrowdsaleStage(1);

		await ico.setTokenAddress(token.address);

		await expect(testTransferCoin(addr1, 10)).not.to.be.reverted;
		await expect(testTransferCoin(addr2, 10)).not.to.be.reverted;
		await expect(testTransferCoin(addr3, 10)).not.to.be.reverted;

		await ico.setCrowdsaleStage(3);

		let price: number = await ico.getPriceuUSD();
		console.log("price " + price);

		// calculating contributions
		let uUSDContributed1 = await ico.getuUSDToClaim(addr1.address);
		let numTokensWithDecimals1 = BigInt(uUSDContributed1) * BigInt(10**18) / BigInt(price);
		console.log("uUSDContributed1 " + uUSDContributed1 + " numTokens1 " + numTokensWithDecimals1);
		let uUSDContributed2 = await ico.getuUSDToClaim(addr2.address);
		let numTokensWithDecimals2 = BigInt(uUSDContributed2) * BigInt(10**18) / BigInt(price);
		console.log("uUSDContributed2 " + uUSDContributed2 + " numTokens2 " + numTokensWithDecimals2);
		let uUSDContributed3 = await ico.getuUSDToClaim(addr3.address);
		let numTokensWithDecimals3 = BigInt(uUSDContributed3) * BigInt(10**18) / BigInt(price);
		console.log("uUSDContributed3 " + uUSDContributed3 + " numTokens3 " + numTokensWithDecimals3);
		let uUSDContributed = uUSDContributed1.add(uUSDContributed2).add(uUSDContributed3);
		let numTokensTotalWithDecimals = numTokensWithDecimals1 + numTokensWithDecimals2 + numTokensWithDecimals3;
		console.log("TotaluUSDContributed " + uUSDContributed + " numTokensTotal " + numTokensTotalWithDecimals);

		// approve from owner to ico
		console.log("Owner " + owner.address + " Approving allowance for " + ico.address + " for " + numTokensTotalWithDecimals);
		await token.approve(ico.address, numTokensTotalWithDecimals);
		console.log("Owner " + owner.address + " Approved allowance for " + ico.address + " for " + numTokensTotalWithDecimals);

		// transfer tokens to investors
		await expect(() => ico.claimAll())
			.to.changeTokenBalances(token, [owner, addr1, addr2, addr3], [BigInt(-1) * numTokensTotalWithDecimals, numTokensWithDecimals1, numTokensWithDecimals2, numTokensWithDecimals3]);
	
		// emptied contributions
		expect(await ico.getuUSDToClaim(addr1.address)).to.equal(0);
		expect(await ico.getContribution(addr1.address, 'COIN')).to.equal(0);
		expect(await ico.getuUSDContribution(addr1.address, 'COIN')).to.equal(0);

		expect(await ico.getuUSDToClaim(addr2.address)).to.equal(0);
		expect(await ico.getContribution(addr2.address, 'COIN')).to.equal(0);
		expect(await ico.getuUSDContribution(addr2.address, 'COIN')).to.equal(0);

		expect(await ico.getuUSDToClaim(addr3.address)).to.equal(0);
		expect(await ico.getContribution(addr3.address, 'COIN')).to.equal(0);
		expect(await ico.getuUSDContribution(addr3.address, 'COIN')).to.equal(0);
	});

});
