export const NETWORK = import.meta.env.VITE_APP_NETWORK ?? "testnet";
export const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS ?? "0x000000000000000000000000000000000000000000000000000000000000cafe";
export const APTOS_API_KEY = import.meta.env.VITE_APTOS_API_KEY;

// LandLedger specific constants
export const LANDLEDGER_MODULE_ADDRESS = MODULE_ADDRESS;
export const COLLECTION_NAME = "LandLedger NFTs";
export const PLATFORM_FEE_BPS = 250; // 2.5%
export const DEFAULT_FRACTIONS_PER_ACRE = 1000;
