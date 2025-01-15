import { PinataSDK } from "pinata-web3"

export const pinata = new PinataSDK({
  pinataJwt: `${process.meta.env.VITE_PINATA_JWT}`,
  pinataGateway: `${process.meta.env.VITE_GATEWAY_URL}`
})
