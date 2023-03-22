import * as dotenv from "dotenv";
require('dotenv').config()
//console.log(process.env) // remove this after you've confirmed it is working

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-gas-reporter";

dotenv.config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
	const accounts = await hre.ethers.getSigners();

	for (const account of accounts) {
		console.log(account.address);
	}
});

const config: HardhatUserConfig = {
	solidity: {
		version: "0.8.18",
		settings: {
			metadata: {
				bytecodeHash: "none",
			},
			optimizer: {
				enabled: true,
				runs: 200
			}
		}
	},
	networks: {
		hardhat: {
			//chainId: 31337 // We set 1337 to make interacting with MetaMask simpler
		},

		// *********************************************************************************************************************************************
		// **************************************************************** Polygon ********************************************************************
		// *********************************************************************************************************************************************
		/*polygon: {
			url: "https://rpc-mainnet.matic.network",																				// https://polygonscan.com/myapikey
			accounts: ["JDPZIUG5KFN9W9KICH69NBETERQJX8UAT6"]																// https://polygonscan.com/myapikey
		},*/
		polygon_mumbai: {
			url: "https://rpc-mumbai.maticvigil.com",																				
			accounts: [process.env.PRIVATE_KEY_2266!],
		},

		// *********************************************************************************************************************************************
		// ****************************************************************** BSC **********************************************************************
		// *********************************************************************************************************************************************
		bscmainnet: {
			url: "https://bsc-dataseed.binance.org/",
			chainId: 56,
			gasPrice: 20000000000,
			accounts: {mnemonic: process.env.MNEMONIC!}
		},
		bsctestnet: {
			url: "https://data-seed-prebsc-1-s1.binance.org:8545",
			chainId: 97,
			gasPrice: 20000000000,
			accounts: {mnemonic: process.env.MNEMONIC!}
		},

		// *********************************************************************************************************************************************
		// *************************************************************** ethereum ********************************************************************
		// *********************************************************************************************************************************************
		mainnet: {
			url: "https://mainnet.infura.io/v3/" + process.env.INFURA_ID, 									// mainnet url with projectId
			accounts: [process.env.PRIVATE_KEY_2266!], 																			// add the account that will deploy the contract (private key)
		},
		sepolia: {
			url: "https://sepolia.infura.io/v3/" + process.env.INFURA_ID,										//sepolia url with projectId
			accounts: [process.env.PRIVATE_KEY_2266!], 																			// add the account that will deploy the contract (private key)
		},
		goerly: {
			url: "https://goerli.infura.io/v3/" + process.env.INFURA_ID,	 									//goerly url with projectId
			accounts: [process.env.PRIVATE_KEY_2266!],																			// add the account that will deploy the contract (private key)
		},


		// *********************************************************************************************************************************************
		// "https://blog.infura.io/post/deprecation-timeline-for-rinkeby-ropsten-and-kovan-testnets
		// "message":"Network decommissioned, please use Goerli or Sepolia instead",
		// "code":-32601,
		/*ropsten: { // deprecated in 2022 - 
			url: "https://ropsten.infura.io/v3/" + process.env.INFURA_ID, 									//Infura url with projectId
			accounts: [process.env.PRIVATE_KEY_2266!],																		 	// add the account that will deploy the contract (private key)
		},
		rinkeby: { // deprecated in 2022
			url: "https://rinkeby.infura.io/v3/" + process.env.INFURA_ID, 									//rinkeby url with projectId
			accounts: [process.env.PRIVATE_KEY_2266!],																		 	// add the account that will deploy the contract (private key)
		},
		kovan: { // deprecated in 2019
			url: "https://kovan.infura.io/v3/" + process.env.INFURA_ID, 										//kovan url with projectId
			accounts: [process.env.PRIVATE_KEY_2266!],																		 	// add the account that will deploy the contract (private key)
		},*/

	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY,
	},
	gasReporter: {
		//enabled: process.env.REPORT_GAS !== undefined,
		enabled: true,
		currency: "USD",
		//showMethodSig: true,
		showTimeSpent:true,
		coinmarketcap: process.env.CMC_ID,
		// gasPriceApi: 'https://api.etherscan.io/api?module=proxy&action=eth_gasPrice',		// ethereum
		// token: 'ETH'
		// gasPriceApi: 'https://api.bscscan.com/api?module=proxy&action=eth_gasPrice',			// BSC
		// token: 'BNB'
		gasPriceApi: 'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice',		// polygon
		token: 'MATIC'
	},
};

export default config;
