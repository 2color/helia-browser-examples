import './styles.css'
import { CID } from 'multiformats'
import { createHeliaHTTP, Helia } from '@helia/http'
import { json } from '@helia/json'
import { trustlessGateway } from '@helia/block-brokers'
// Three imports to resolve an IPNS name
import { ipns as IPNS } from '@helia/ipns'
// This 👇 is needed to be able to resolve IPNS names
import { peerIdFromString } from '@libp2p/peer-id'
import { delegatedHTTPRouting } from '@helia/routers'

// dag-json
const exampleCid = `baguqeeraxyfyo2lrqhusen7rlzke3e3iqrtpedqwxpjkp4i5thghhun2pfqa`
const exampleIpns = `k51qzi5uqu5di4qhp7oa8qcwmlt94dyd68it5dn60lmwbg4by0s24l3by9sene`

let helia = await createHeliaHTTP({
  blockBrokers: [
    trustlessGateway({
      gateways: ['https://cloudflare-ipfs.com', 'https://ipfs.io'],
    }),
  ],
  routers: [delegatedHTTPRouting('https://delegated-ipfs.dev')],
})

const getJson = async (helia: Helia, cid: string) => {
  const j = json(helia)
  return await j.get(CID.parse(cid))
}

const resolveIpns = async (helia: Helia, ipnsName: string) => {
  // If `ipns` is a constructor, why does it start lowercase?
  const ipns = IPNS(helia)

  const peerID = peerIdFromString(ipnsName)

  return await ipns.resolve(peerID)
}

document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output')
  const ipnsInput = document.getElementById('ipns-name') as HTMLInputElement
  const fetchJsonButton = document.getElementById('button-fetch-json')
  const resolveIpnsButton = document.getElementById('button-resolve-ipns')

  fetchJsonButton?.addEventListener('click', async () => {
    const response = await getJson(helia, exampleCid)

    if (!output) return
    output.innerHTML = JSON.stringify(response, null, '\t')
  })

  resolveIpnsButton?.addEventListener('click', async () => {
    const cid = await resolveIpns(helia, ipnsInput.value)

    if (!output) return
    output.innerHTML = `
    ${ipnsInput.value}
    points to 👇
    ${cid.toV1().toString()}
    `
  })
})
