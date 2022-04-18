const main = async () => {
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.getBalance();
    console.log("Deploying contracts with account: ", deployer.address);
    console.log("Account Balance: ", accountBalance.toString());

    const TipdappContractFactory = await hre.ethers.getContractFactory("Tipdapp");
    const TipdappContract = await TipdappContractFactory.deploy({value: hre.ethers.utils.parseEther("0.005"),});
    await TipdappContract.deployed();
    console.log("TipDappContract deployed at: ", TipdappContract.address);
}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
}

runMain();