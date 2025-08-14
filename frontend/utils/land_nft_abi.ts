export const LAND_NFT_ABI = {
  address: "0x000000000000000000000000000000000000000000000000000000000000cafe",
  name: "land_nft",
  friends: [],
  structs: [
    {
      name: "LandMetadata",
      is_native: false,
      abilities: ["key", "store"],
      generic_type_params: [],
      fields: [
        {
          name: "land_id",
          type: "0x1::string::String",
        },
        {
          name: "owner_id", 
          type: "0x1::string::String",
        },
        {
          name: "geo_tag",
          type: "0x1::string::String",
        },
        {
          name: "proof_hash",
          type: "0x1::string::String",
        },
        {
          name: "area_acres",
          type: "u64",
        },
        {
          name: "location",
          type: "0x1::string::String",
        },
        {
          name: "created_at",
          type: "u64",
        },
        {
          name: "is_fractionalized",
          type: "bool",
        },
      ],
    },
  ],
  exposed_functions: [
    {
      name: "mint_land_nft",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        "0x1::string::String",
        "0x1::string::String", 
        "0x1::string::String",
        "0x1::string::String",
        "u64",
        "0x1::string::String",
      ],
      return: [],
    },
    {
      name: "mark_as_fractionalized",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        "0x000000000000000000000000000000000000000000000000000000000000cafe::land_nft::LandMetadata",
        "u64",
      ],
      return: [],
    },
    {
      name: "get_land_metadata",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [
        "0x000000000000000000000000000000000000000000000000000000000000cafe::land_nft::LandMetadata",
      ],
      return: [
        "0x1::string::String",
        "0x1::string::String",
        "0x1::string::String", 
        "0x1::string::String",
        "u64",
        "0x1::string::String",
        "u64",
        "bool",
      ],
    },
    {
      name: "get_collection_info",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [],
      return: [
        "0x1::string::String",
        "0x1::string::String",
        "u64",
      ],
    },
    {
      name: "is_land_fractionalized",
      visibility: "public", 
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [
        "0x000000000000000000000000000000000000000000000000000000000000cafe::land_nft::LandMetadata",
      ],
      return: ["bool"],
    },
  ],
} as const;
