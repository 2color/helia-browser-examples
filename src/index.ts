import './styles.css'
import { CID } from 'multiformats'
import { createHelia, Helia } from 'helia'
import { json } from '@helia/json'
import { trustlessGateway } from '@helia/block-brokers'
// Three imports to resolve an IPNS name
import { ipns as IPNS } from '@helia/ipns'
// This 👇 is needed to resolve IPNS over Libp2p which is over delegated routing API
import { libp2p } from '@helia/ipns/routing'
// This 👇 is needed to be able to resolve IPNS names
import { peerIdFromString } from '@libp2p/peer-id'
import { createDelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client'

// dag-json
const exampleCid = `baguqeeraxyfyo2lrqhusen7rlzke3e3iqrtpedqwxpjkp4i5thghhun2pfqa`
const exampleIpns = `k51qzi5uqu5dhp48cti0590jyvwgxssrii0zdf19pyfsxwoqomqvfg6bg8qj3s`

let helia = await createHelia({
  blockBrokers: [
    trustlessGateway({
      gateways: ['https://cloudflare-ipfs.com', 'https://ipfs.io'],
    }),
  ],
  libp2p: {
    // This 👇 is a no-op  since `createHelia` will start libp2p anyway
    start: false,
    // This 👇 is needed so that libp2p doesn't start opening connections to bootstrap and discovered nodes
    connectionManager: {
      minConnections: 0,
    },
    services: {
      delegatedRouting: () => createDelegatedRoutingV1HttpApiClient('https://delegated-ipfs.dev'),
    },
  },
})

const getJson = async (helia: Helia, cid: string) => {
  const j = json(helia)
  return await j.get(CID.parse(cid))
}

const resolveIpns = async (helia: Helia, ipnsName: string) => {
  // If `ipns` is a constructor, why does it start lowercase?
  const ipns = IPNS(helia, { routers: [libp2p(helia)] })

  const peerID = peerIdFromString(ipnsName)

  return await ipns.resolve(peerID)
}

document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output')
  const fetchJsonButton = document.getElementById('button-fetch-json')
  const resolveIpnsButton = document.getElementById('button-resolve-ipns')

  fetchJsonButton?.addEventListener('click', async () => {
    const response = await getJson(helia, exampleCid)

    if (!output) return
    output.innerHTML = JSON.stringify(response, null, '\t')
  })

  resolveIpnsButton?.addEventListener('click', async () => {
    const cid = await resolveIpns(helia, exampleIpns)

    if (!output) return
    output.innerHTML = `
    ${exampleIpns} 
    points to 👇
    ${cid.toV1().toString()}
    `
  })
})
