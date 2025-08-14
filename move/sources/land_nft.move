module landledger_addr::land_nft {
    use std::signer;
    use std::string::{Self, String};
    use std::option;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::account;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_LAND_ID: u64 = 2;
    const E_LAND_ALREADY_EXISTS: u64 = 3;
    const E_INSUFFICIENT_BALANCE: u64 = 4;
    const E_INVALID_SIGNER: u64 = 5;

    /// Land metadata structure
    struct LandMetadata has key, store {
        land_id: String,
        owner_id: String,
        geo_tag: String,
        proof_hash: String,
        area_acres: u64,
        location: String,
        created_at: u64,
        is_fractionalized: bool,
        minting_fee_paid: u64,
    }

    /// Collection and token configuration
    struct LandNFTConfig has key {
        collection_name: String,
        collection_description: String,
        collection_uri: String,
        total_lands: u64,
        minting_fee: u64, // Fee in APT (octas)
        admin_address: address,
    }

    /// Registry to track land IDs and prevent duplicates
    struct LandRegistry has key {
        registered_lands: vector<String>,
    }

    /// Events
    #[event]
    struct LandNFTMinted has drop, store {
        land_id: String,
        owner: address,
        token_address: address,
        area_acres: u64,
        minting_fee_paid: u64,
        timestamp: u64,
    }

    #[event]
    struct LandFractionalized has drop, store {
        land_id: String,
        owner: address,
        total_fractions: u64,
        timestamp: u64,
    }

    #[event]
    struct MintingFeeUpdated has drop, store {
        old_fee: u64,
        new_fee: u64,
        updated_by: address,
        timestamp: u64,
    }

    /// Initialize the module
    fun init_module(deployer: &signer) {
        let collection_name = string::utf8(b"LandLedger NFTs");
        let collection_description = string::utf8(b"Tokenized agricultural land parcels for fractional ownership");
        let collection_uri = string::utf8(b"https://landledger.io/collection");

        // Create the collection
        collection::create_unlimited_collection(
            deployer,
            collection_description,
            collection_name,
            option::none(),
            collection_uri,
        );

        // Store configuration
        move_to(deployer, LandNFTConfig {
            collection_name,
            collection_description,
            collection_uri,
            total_lands: 0,
            minting_fee: 1000000, // 0.01 APT in octas
            admin_address: signer::address_of(deployer),
        });

        // Initialize land registry
        move_to(deployer, LandRegistry {
            registered_lands: vector::empty<String>(),
        });
    }

    /// Mint a new land NFT with enhanced validation and fee payment
    public entry fun mint_land_nft(
        owner: &signer,
        land_id: String,
        owner_id: String,
        geo_tag: String,
        proof_hash: String,
        area_acres: u64,
        location: String,
    ) acquires LandNFTConfig, LandRegistry {
        let owner_address = signer::address_of(owner);
        
        // Validate signer has an account
        assert!(account::exists_at(owner_address), E_INVALID_SIGNER);
        
        let config = borrow_global_mut<LandNFTConfig>(@landledger_addr);
        let registry = borrow_global_mut<LandRegistry>(@landledger_addr);

        // Check if land ID already exists
        assert!(!vector::contains(&registry.registered_lands, &land_id), E_LAND_ALREADY_EXISTS);

        // Validate minimum area
        assert!(area_acres > 0, E_INVALID_LAND_ID);

        // Check if user has sufficient balance for minting fee
        let user_balance = aptos_framework::coin::balance<aptos_framework::aptos_coin::AptosCoin>(owner_address);
        assert!(user_balance >= config.minting_fee, E_INSUFFICIENT_BALANCE);

        // Transfer minting fee to admin
        if (config.minting_fee > 0) {
            aptos_framework::coin::transfer<aptos_framework::aptos_coin::AptosCoin>(
                owner,
                config.admin_address,
                config.minting_fee
            );
        };

        // Create token name and description
        let token_name = string::utf8(b"Land Parcel #");
        string::append(&mut token_name, land_id);
        
        let token_description = string::utf8(b"Agricultural land parcel located at ");
        string::append(&mut token_description, location);
        
        let token_uri = string::utf8(b"https://landledger.io/land/");
        string::append(&mut token_uri, land_id);

        // Create the token
        let constructor_ref = token::create_named_token(
            owner,
            config.collection_name,
            token_description,
            token_name,
            option::none(),
            token_uri,
        );

        let token_signer = object::generate_signer(&constructor_ref);
        let token_address = signer::address_of(&token_signer);

        // Store land metadata
        move_to(&token_signer, LandMetadata {
            land_id,
            owner_id,
            geo_tag,
            proof_hash,
            area_acres,
            location,
            created_at: timestamp::now_seconds(),
            is_fractionalized: false,
            minting_fee_paid: config.minting_fee,
        });

        // Add to registry
        vector::push_back(&mut registry.registered_lands, land_id);

        // Update config
        config.total_lands = config.total_lands + 1;

        // Emit event
        event::emit(LandNFTMinted {
            land_id,
            owner: owner_address,
            token_address,
            area_acres,
            minting_fee_paid: config.minting_fee,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Admin function to update minting fee
    public entry fun update_minting_fee(
        admin: &signer,
        new_fee: u64,
    ) acquires LandNFTConfig {
        let config = borrow_global_mut<LandNFTConfig>(@landledger_addr);
        
        // Only admin can update fee
        assert!(signer::address_of(admin) == config.admin_address, E_NOT_AUTHORIZED);
        
        let old_fee = config.minting_fee;
        config.minting_fee = new_fee;

        // Emit event
        event::emit(MintingFeeUpdated {
            old_fee,
            new_fee,
            updated_by: signer::address_of(admin),
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Mark land as fractionalized
    public entry fun mark_as_fractionalized(
        owner: &signer,
        token_object: Object<LandMetadata>,
        total_fractions: u64,
    ) acquires LandMetadata {
        let token_address = object::object_address(&token_object);
        let land_metadata = borrow_global_mut<LandMetadata>(token_address);

        // Only token owner can fractionalize
        assert!(object::is_owner(token_object, signer::address_of(owner)), E_NOT_AUTHORIZED);
        
        land_metadata.is_fractionalized = true;

        // Emit event
        event::emit(LandFractionalized {
            land_id: land_metadata.land_id,
            owner: signer::address_of(owner),
            total_fractions,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// View functions
    #[view]
    public fun get_land_metadata(token_object: Object<LandMetadata>): (String, String, String, String, u64, String, u64, bool, u64) acquires LandMetadata {
        let token_address = object::object_address(&token_object);
        let metadata = borrow_global<LandMetadata>(token_address);
        (
            metadata.land_id,
            metadata.owner_id,
            metadata.geo_tag,
            metadata.proof_hash,
            metadata.area_acres,
            metadata.location,
            metadata.created_at,
            metadata.is_fractionalized,
            metadata.minting_fee_paid
        )
    }

    #[view]
    public fun get_collection_info(): (String, String, u64, u64) acquires LandNFTConfig {
        let config = borrow_global<LandNFTConfig>(@landledger_addr);
        (config.collection_name, config.collection_description, config.total_lands, config.minting_fee)
    }

    #[view]
    public fun is_land_fractionalized(token_object: Object<LandMetadata>): bool acquires LandMetadata {
        let token_address = object::object_address(&token_object);
        let metadata = borrow_global<LandMetadata>(token_address);
        metadata.is_fractionalized
    }

    #[view]
    public fun get_minting_fee(): u64 acquires LandNFTConfig {
        let config = borrow_global<LandNFTConfig>(@landledger_addr);
        config.minting_fee
    }

    #[view]
    public fun land_exists(land_id: String): bool acquires LandRegistry {
        let registry = borrow_global<LandRegistry>(@landledger_addr);
        vector::contains(&registry.registered_lands, &land_id)
    }
}