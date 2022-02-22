import { ethers } from "ethers"
import { parseEther } from 'ethers/lib/utils'
import ICOJSON from '../../artifacts/contracts/SpacecoinICO.sol/SpacecoinICO.json'
import SpacecoinJSON from '../../artifacts/contracts/Spacecoin.sol/Spacecoin.json'
import { React, useEffect, useState } from 'react'


const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()

window.ethers = ethers
window.provider = provider
window.signer = signer

const SpacecoinICO = '0x9FBF7Fbf0cCef7eBaA3B82fF459D464E50be94AE'
const ico = new ethers.Contract(SpacecoinICO, ICOJSON.abi, provider)


async function connectToMetamask() {
    try {
      console.log('Signed in', await signer.getAddress())
    } catch (err) {
      console.log('Not signed in', err)
      await provider.send('eth_requestAccounts', [])
    }
  }
export const App = () => {
    const [contribution, setContribution] = useState(0)
    const [purchaseAmount, setPurchaseAmount] = useState()
    const [error, setError] = useState('Purchase was not successful')

  
    const connect = async () => {
        await connectToMetamask()
    }

    
    const buy = async () => {
   
        try {
          const tx = await ico
            .connect(signer)
            .contribute({ value: parseEther(purchaseAmount) })
          await tx.wait()
          console.log("Success")
          setError('')
        } catch (err) {
            console.log(err)
          setError(err.message)
        }
        
    }

    useEffect(() => {
        connect()
        loadSpcToken()
        fetchContribution()
      }, [])

    const loadSpcToken = async () => {
        const spacecoinAddr = await ico.spacecoin()
        spc = new ethers.Contract(spacecoinAddr, SpacecoinJSON.abi, provider)
    }
    const fetchContribution = async () => {
        const currentAddr = await signer.getAddress()
        const totalContributions = Number(
        await ico.getBalance(currentAddr)
        )
        setContribution(totalContributions)
      }
    return (
    
        <>
        <div className="main">
           <div className="left-header">
                <div className="logo"></div>
                <span>Smart-Contracts for the next generation of thinkers</span>
                <span>Agreements made smarter</span>
            </div> 
            <div className="center-header">

                <h1>SpaceCoin</h1>
            <div>
                <h2>The Token That Powers SpaceDAO</h2>

                <h3>TOKEN SALE</h3>
                <span>Start Date & Time</span><br/>
                <span>July 16th, 20 GMT+8 (14:00 Berlin)</span>
            
            </div>
            <div>
                <h2>Deposit ETH</h2>
                <div>You Currently Own {contribution * 5} SPC</div>
                <input onChange={(e) => setPurchaseAmount(e.target.value)}/>
                <span>ETH</span>
            </div>
            <button onClick={buy}>BUY</button>
            <p></p>

            </div> 
            <div className="right-header">
            </div> 
        </div>
        </>
      )
}