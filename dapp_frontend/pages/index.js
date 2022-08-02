import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {ethers} from 'ethers'
import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { abi,rivera_address } from '../constants'

export default function Home() {
  const [signer,setSigner] = useState(null);
  const [contract,setContract] = useState(null);
  const [connected,setConnected] = useState(false);
  const [msg,setMsg] = useState("");
  const [tokenId,setTokenId] = useState(0);
  const connect = async () => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const chainId = await signer.getChainId();
      if( chainId !== 80001){
        throw new Error("connect to matic testnet");
      }
      setSigner(signer);
      setConnected(true);
      const contract = new ethers.Contract(rivera_address,abi,signer);
      setContract(contract);
    }

    catch(error){
      toast(error.message)
    }
  } 
  
  const checkForFreeAccess = async () => {
    try{
      const token = await contract.tokenIds();
      setTokenId(token);
      if(token < 3){
        setMsg("You can mint Nft for free");
      }
      else{
        setMsg("As of Now Free nfts are over So you need to mint nft for 1 Matic");
      }
    }
    catch(error){
      toast(error.message);
    } 
  }

  const mint = async () => {
    try{
      let tx;
      if(tokenId < 3){
        tx = await contract.mint();
      }
      else{
        tx = await contract.mint({value:ethers.utils.parseEther("1")});
      }
      await tx.wait();
      checkForFreeAccess();
      toast("Minted")
    }
    catch(error){
      if(error.code == -32603){
        toast("Insufficient funds in wallet");
      }
      else{
        toast(error.message);
      }
    }
  }

  useEffect(() => {
    if(connected){
      checkForFreeAccess();
    }
  }
  ,[connected])


  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <div className='flex flex-row-reverse'>
          <button onClick={connect} className="p-4 m-5 rounded-xl bg-blue-300">{signer==null ? "Connect wallet" : "Connected"}</button>
        </div>
        <div>
          <div className='flex flex-col items-center mt-10'>
            <div className='text-xl'>
              {msg}
            </div>
            <button onClick={mint} className="p-4 m-5 rounded-xl bg-blue-300 mt-10">Mint</button>
          </div>
        </div>
        <ToastContainer position="top-center"/>
      </div>
    </div>
  )
}
