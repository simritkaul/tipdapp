import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from '../utils/Tipdapp.json';

const App = () => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [canSendTip, setSendTipStatus] = useState(false);
    const [inputTip, setInputTip] = useState("");
    const [allTips, setAllTips] = useState([]);

    const contractAddress = "0x7Cdb8710360eAe7b67197488F3F250c1c09B3DDe";
    const contractABI = abi.abi;

    const getAllTips = async () => {
        try {
          const { ethereum } = window;
          if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const tipdappContract = new ethers.Contract(contractAddress, contractABI, signer);

            const tips = await tipdappContract.getAllTips();
    
    
            // We only need address, timestamp, and message in our UI so let's pick those out
            const tipsCleaned = tips.map(tip => {
              return {
                address: tip.tipper,
                timestamp: new Date(tip.timestamp * 1000),
                message: tip.message,
              };
            });
    
            /*
             * Store our data in React State
             */
            setAllTips(tipsCleaned);
          } 
          else {
            console.log("Ethereum object doesn't exist!")
          }
        } catch (error) {
          console.log(error);
        }
      }

      const handleInput = (e) => {
        // Selecting the input element and get its value 
        const inputVal = e.target.value;
        if (inputVal.length > 0) {
            setSendTipStatus(true);
            setInputTip(inputVal.toString());
        }
        else {
            setSendTipStatus(false);
            setInputTip(inputVal.toString());
        }
    }

    const walletConnectionCheck = async () => {
        try {
            const { ethereum } = window;
            if(!ethereum){
                console.log("Make sure you have metamask.");
                return;
            }
            else {
                console.log("We have the ethereum object.");
            }

            // Checking if we can access the user's wallet
            const accounts = await ethereum.request({method: "eth_accounts"});

            if(accounts.length !== 0){
                const account = accounts[0];
                console.log("Found an authorized account: ", account);
                setCurrentAccount(account);
            }
            else {
                console.log("No authorized account found!");
            }
        } 
        catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        let tipdappContract;
      
        const onNewTip = (from, timestamp, message) => {
          console.log("NewTip", from, timestamp, message);
          setAllTips(prevState => [
            ...prevState,
            {
              address: from,
              timestamp: new Date(timestamp * 1000),
              message: message,
            },
          ]);
        };
      
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
      
          tipdappContract = new ethers.Contract(contractAddress, contractABI, signer);
          tipdappContract.on("NewTip", onNewTip);
        }
      
        return () => {
          if (tipdappContract) {
            tipdappContract.off("NewTip", onNewTip);
          }
        };
    }, []);

    const connectWallet = async () => {
        try {
            const { ethereum } = window;
            if(!ethereum){
                alert("Get Metamask!");
                return;
            }
            
            const accounts = await ethereum.request({method: "eth_requestAccounts"});
            console.log("Connected ", accounts[0]);
            setCurrentAccount(accounts[0]);
            getAllTips();
        }
        catch (error) {
            console.log(error);
        }
    }

    const sendTip = async (theTip) => {
        try {
            const { ethereum } = window;
            if(ethereum){
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const tipdappContract = new ethers.Contract(contractAddress, contractABI, signer);

                const tipTx = await tipdappContract.sendTip(theTip, { gasLimit: 300000 });
                console.log("Mining --", tipTx.hash);

                await tipTx.wait();
                console.log("Mined --", tipTx.hash);

                setInputTip("");
            }
            else {
                console.log("Ethereum object doesn't exist.");
            }
        } 
        catch (error) {
            console.log(error);
            setInputTip("");
            setSendTipStatus(false);
        }
    }

    useEffect(() => {
        walletConnectionCheck();
    }, []);

    return (
        <div className="app-container">
            <h1 className='title'>TipDapp</h1>
            <p className="subtitle">Connect your Ethereum wallet and share a tip that might help people!</p>
            <p className="wineth">P.S. You might win some ETH</p>
            {currentAccount && (
                <div className="tipform">
                    <textarea 
                        type="text" 
                        name="message" 
                        placeholder='Type the tip' 
                        className='tipinput'
                        value={inputTip}
                        onChange={handleInput}
                    />
                    <button className="btn tipbtn" disabled={!canSendTip} onClick={() => sendTip(inputTip)}>Share the Tip!</button>
                </div>
            )}
            
            {/* If there is no currentAccount render this button */}
            {!currentAccount && (
            <button className="btn connbtn" onClick={connectWallet}>
                Connect Wallet
            </button>
            )}
            <div className="tips-container">
                {
                    allTips.map((tip, index) => {
                        return (
                            <div key={index} className= "tipInfo">
                                <p className='message'>"{tip.message}"</p>
                                <p className='address'>From: {tip.address}</p>
                                <p className='time'>Time: {tip.timestamp.toString()}</p>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default App;