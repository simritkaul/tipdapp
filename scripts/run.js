const main = async () => {
    const TipdappContractFactory = await hre.ethers.getContractFactory("Tipdapp");
    const TipdappContract = await TipdappContractFactory.deploy({value: hre.ethers.utils.parseEther("0.01"),})
    await TipdappContract.deployed();
    console.log("Contract deployed to: ", TipdappContract.address);

    let contractBalance = await hre.ethers.provider.getBalance(TipdappContract.address);
    console.log("Contract Balance: ", contractBalance);

    // Sending a tip
    let tipTx = await TipdappContract.sendTip("Don't lift heavy on your first day of gym.");
    await tipTx.wait(); // Wait for the transaction to be mined

    const [_, randomPerson] = await hre.ethers.getSigners();
    tipTx = await TipdappContract.connect(randomPerson).sendTip("Learn basic cooking!");
    await tipTx.wait();
    
    contractBalance = await hre.ethers.provider.getBalance(TipdappContract.address);
    console.log("Contract balance: ", contractBalance);

    let allTips = await TipdappContract.getAllTips();
    console.log(allTips);
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