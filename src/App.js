import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';

function App() {
  const messageRef = useRef();

  const [currentAccount, setCurrentAccount] = useState('');
  const [modalBox, setModalBox] = useState({
    open: false,
    message: '',
  });

  const [allWaves, setAllWaves] = useState([]);
  const [sent, setSent] = useState(false);
  const [thankyouMessage, setThankyouMessage] = useState('');
  const [hash, setHash] = useState('');

  const assert = require('assert').strict;
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  assert.ok(
    contractAddress,
    'The "REACT_APP_CONTRACT_ADDRESS" environment variable is required'
  );

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    const networkVersion = ethereum ? ethereum.networkVersion : null;
    console.log('Network Version: ', networkVersion);

    try {
      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object.', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account.');
        setCurrentAccount(account);

        // calling getAllWaves()
        getAllWaves();
      } else {
        console.log('No authorized account found.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const { ethereum } = window;

    try {
      if (!ethereum) {
        console.log('Get MetaMask!');
        setModalBox({ open: true, message: 'Get MetaMask!' });
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { ethereum } = window;
    // const { networkVersion } = ethereum;
    const networkVersion = ethereum ? ethereum.networkVersion : null;

    // const { isMetaMask } = ethereum;
    const isMetaMask = ethereum ? ethereum.isMetaMask : null;

    console.log(`Network Version: ${networkVersion}`);

    if (!isMetaMask) {
      console.log(
        'Please connect with MetaMask and select Rinkeby Test Network.'
      );
      setModalBox({
        open: true,
        message:
          'Please connect with MetaMask and select Rinkeby Test Network.',
      });
      return;
    }

    if (Number(networkVersion) !== 4) {
      console.log(
        'Please change your Network to Rinkeby Test Network and refresh page.'
      );
      setModalBox({
        open: true,
        message:
          'Please change your Network to Rinkeby Test Network and refresh page.',
      });
      return;
    }

    if (messageRef.current.value === '') {
      console.log('Message cannot be empty.');
      setModalBox({ open: true, message: 'Message cannot be empty!' });
      return;
    }

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());

        const waveTxn = await wavePortalContract.wave(
          messageRef.current.value,
          { gasLimit: 300000 }
        );
        console.log('Mining...', waveTxn.hash);
        setSent(true);
        setThankyouMessage(
          `Thank you! Your message was sent. This will refresh automatically.`
        );
        setHash(waveTxn.hash);

        await waveTxn.wait();
        console.log('Mined -- ', waveTxn.hash);
        setThankyouMessage(`Your message is now in the blockchain! 👇`);

        count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    const { ethereum } = window;
    // const { networkVersion } = ethereum;
    const networkVersion = ethereum ? ethereum.networkVersion : null;
    console.log('get all waves.', ethereum, networkVersion);

    if (Number(networkVersion) !== 4) {
      console.log(
        'Please change your Network to Rinkeby Test Network and refresh page.'
      );

      return;
    }

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];

        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        setAllWaves(wavesCleaned.reverse());

        wavePortalContract.on('NewWave', (from, timestamp, message) => {
          console.log(from, timestamp, messageRef);

          setAllWaves((prevState) => [
            {
              address: from,
              timestamp: new Date(timestamp * 1000),
              message: message,
            },
            ...prevState,
          ]);
        });
      } else {
        console.log("Ethereum object doesn't exist.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img">😻</span> Hey there!
        </div>

        <div className="bio">
          I am{' '}
          <a
            href="https://twitter.com/melwyntee"
            target="_blank"
            rel="noopener noreferrer"
          >
            Melwyn
          </a>{' '}
          and I work on cool projects deployed on web3 technologies!
          <br />
          Connect your MetaMask wallet, 👋 send me a message and if you are
          lucky enough you'll receive some 🤑 Eth!
          <br />
          <br />
          <span style={{ color: 'gray', fontSize: '12px' }}>
            This is deployed on Rinkeby Test Network and you can get free (
            <del>fake</del>) Eth here{' '}
            <a
              href="https://app.mycrypto.com/faucet"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://app.mycrypto.com/faucet
            </a>{' '}
            (make sure to connect your wallet to the site and click on this link
            agains)
          </span>
          <br />
          <br />
        </div>

        {sent ? (
          <>
            <div className="thankyou">{thankyouMessage}</div>
            <div className="hash">
              <a
                href={`https://rinkeby.etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Click here to check the transaction.
              </a>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              ref={messageRef}
              className="messageBox"
              placeholder="Enter your message here..."
            ></textarea>
            <button className="waveButton" type="submit">
              Send message!
            </button>
          </form>
        )}

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {allWaves.map((wave, index) => {
          return (
            <div key={index} className="wave">
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
      <Modal
        isOpen={modalBox.open}
        onRequestClose={() => setModalBox({ open: false, message: '' })}
      >
        {modalBox.message}
      </Modal>
    </div>
  );
}

export default App;
