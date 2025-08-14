module landledger_addr::fractional_token {
    use std::signer;
    use std::string::{Self, String};
    use std::option;
    use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, BurnRef, Metadata};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use landledger_addr::land_nft::{Self, LandMetadata};

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_LAND_NOT_FRACTIONALIZED: u64 = 3;
    const E_INVALID_AMOUNT: u64 = 4;
    const E_INSUFFICIENT_PAYMENT: u64 = 5;
    const E_LAND_ALREADY_FRACTIONALIZED: u64 = 6;

    /// Fractional asset configuration with pricing
    struct FractionalAssetConfig has key {
        mint_ref: MintRef,
        transfer_ref: TransferRef,
        burn_ref: BurnRef,
        land_token_object: Object<LandMetadata>,
        total_supply: u64,
        fraction_per_acre: u64,
        creation_fee_paid: u64,
        price_per_token: u64, // Initial price in APT (octas)
    }

    /// Events
    #[event]
    struct FractionalTokensCreated has drop, store {
        land_id: String,
        asset_metadata: address,
        total_supply: u64,
        fraction_per_acre: u64,
        creation_fee_paid: u64,
        price_per_token: u64,
        timestamp: u64,
    }

    #[event]
    struct FractionalTokensTransferred has drop, store {
        from: address,
        to: address,
        amount: u64,
        asset_metadata: address,
        timestamp: u64,
    }

    #[event]
    struct TokensPurchased has drop, store {
        buyer: address,
        seller: address,
        amount: u64,
        price_per_token: u64,
        total_cost: u64,
        asset_metadata: address,
        timestamp: u64,
    }

    /// Create fractional tokens for a land NFT with creation fee
    public entry fun create_fractional_tokens(
        owner: &signer,
        land_token_object: Object<LandMetadata>,
        fraction_per_acre: u64,
        price_per_token: u64,
    ) acquires FractionalAssetConfig {
        let owner_address = signer::address_of(owner);
        
        // Verify ownership of the land NFT
        assert!(object::is_owner(land_token_object, owner_address), E_NOT_AUTHORIZED);
        
        // Get land metadata
        let (land_id, _, _, _, area_acres, _, _, is_fractionalized) = land_nft::get_land_metadata(land_token_object);
        assert!(!is_fractionalized, E_LAND_ALREADY_FRACTIONALIZED);
        
        // Calculate creation fee (0.1 APT per acre)
        let creation_fee = area_acres * 10000000; // 0.1 APT per acre in octas
        
        // REAL WALLET CHECK: Verify owner has enough APT for creation fee
        let balance = coin::balance<AptosCoin>(owner_address);
        assert!(balance >= creation_fee, E_INSUFFICIENT_PAYMENT);
        
        // REAL TRANSACTION: Pay creation fee
        coin::transfer<AptosCoin>(owner, @landledger_addr, creation_fee);
        
        // Calculate total supply
        let total_supply = area_acres * fraction_per_acre;
        
        // Create asset name and symbol
        let asset_name = string::utf8(b"Land Fraction - ");
        string::append(&mut asset_name, land_id);
        
        let asset_symbol = string::utf8(b"LF-");
        string::append(&mut asset_symbol, land_id);
        
        // Create the fungible asset
        let constructor_ref = object::create_named_object(owner, *string::bytes(&asset_symbol));
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            &constructor_ref,
            option::none(),
            asset_name,
            asset_symbol,
            8, // decimals
            string::utf8(b"https://landledger.io/icons/fraction.png"),
            string::utf8(b"https://landledger.io"),
        );

        let asset_signer = object::generate_signer(&constructor_ref);
        let mint_ref = fungible_asset::generate_mint_ref(&constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(&constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(&constructor_ref);
        let metadata = object::object_from_constructor_ref<Metadata>(&constructor_ref);

        // Store configuration
        move_to(&asset_signer, FractionalAssetConfig {
            mint_ref,
            transfer_ref,
            burn_ref,
            land_token_object,
            total_supply,
            fraction_per_acre,
            creation_fee_paid: creation_fee,
            price_per_token,
        });

        // Mint tokens to the land owner
        let asset_metadata = object::object_address(&metadata);
        let config = borrow_global<FractionalAssetConfig>(asset_metadata);
        let fungible_asset = fungible_asset::mint(&config.mint_ref, total_supply);
        primary_fungible_store::deposit(owner_address, fungible_asset);

        // Mark land as fractionalized
        land_nft::mark_as_fractionalized(owner, land_token_object, total_supply);

        // Emit event
        event::emit(FractionalTokensCreated {
            land_id,
            asset_metadata,
            total_supply,
            fraction_per_acre,
            creation_fee_paid: creation_fee,
            price_per_token,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Direct purchase of fractional tokens from current holder
    public entry fun purchase_tokens(
        buyer: &signer,
        seller: address,
        asset_metadata: Object<Metadata>,
        amount: u64,
    ) acquires FractionalAssetConfig {
        let buyer_address = signer::address_of(buyer);
        let asset_address = object::object_address(&asset_metadata);
        
        assert!(amount > 0, E_INVALID_AMOUNT);
        assert!(buyer_address != seller, E_INVALID_AMOUNT);
        
        let config = borrow_global<FractionalAssetConfig>(asset_address);
        let total_cost = amount * config.price_per_token;
        
        // REAL WALLET CHECKS
        let buyer_apt_balance = coin::balance<AptosCoin>(buyer_address);
        assert!(buyer_apt_balance >= total_cost, E_INSUFFICIENT_PAYMENT);
        
        let seller_token_balance = primary_fungible_store::balance(seller, asset_metadata);
        assert!(seller_token_balance >= amount, E_INSUFFICIENT_BALANCE);
        
        // REAL TRANSACTIONS
        // Transfer APT from buyer to seller
        coin::transfer<AptosCoin>(buyer, seller, total_cost);
        
        // Transfer tokens from seller to buyer (requires seller approval in real implementation)
        // For demo, assuming seller has pre-approved the transfer
        primary_fungible_store::transfer_with_ref(
            &config.transfer_ref,
            seller,
            buyer_address,
            asset_metadata,
            amount
        );
        
        // Emit event
        event::emit(TokensPurchased {
            buyer: buyer_address,
            seller,
            amount,
            price_per_token: config.price_per_token,
            total_cost,
            asset_metadata: asset_address,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Transfer fractional tokens with real balance checks
    public entry fun transfer_fractional_tokens(
        from: &signer,
        to: address,
        asset_metadata: Object<Metadata>,
        amount: u64,
    ) {
        let from_address = signer::address_of(from);
        assert!(amount > 0, E_INVALID_AMOUNT);
        
        // REAL WALLET CHECK: Verify sender has enough tokens
        let balance = primary_fungible_store::balance(from_address, asset_metadata);
        assert!(balance >= amount, E_INSUFFICIENT_BALANCE);
        
        // REAL TRANSACTION: Transfer tokens
        primary_fungible_store::transfer(from, asset_metadata, to, amount);

        // Emit event
        event::emit(FractionalTokensTransferred {
            from: from_address,
            to,
            amount,
            asset_metadata: object::object_address(&asset_metadata),
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Burn fractional tokens with buyback payment
    public entry fun burn_fractional_tokens(
        owner: &signer,
        token_holder: address,
        asset_metadata: Object<Metadata>,
        amount: u64,
    ) acquires FractionalAssetConfig {
        let owner_address = signer::address_of(owner);
        let asset_address = object::object_address(&asset_metadata);
        let config = borrow_global<FractionalAssetConfig>(asset_address);
        
        // Verify ownership of the underlying land
        assert!(object::is_owner(config.land_token_object, owner_address), E_NOT_AUTHORIZED);
        
        // Calculate buyback cost
        let buyback_cost = amount * config.price_per_token;
        
        // REAL WALLET CHECKS
        let owner_balance = coin::balance<AptosCoin>(owner_address);
        assert!(owner_balance >= buyback_cost, E_INSUFFICIENT_PAYMENT);
        
        let holder_token_balance = primary_fungible_store::balance(token_holder, asset_metadata);
        assert!(holder_token_balance >= amount, E_INSUFFICIENT_BALANCE);
        
        // REAL TRANSACTIONS
        // Pay token holder for their tokens
        coin::transfer<AptosCoin>(owner, token_holder, buyback_cost);
        
        // Transfer tokens to owner then burn them
        primary_fungible_store::transfer_with_ref(
            &config.transfer_ref,
            token_holder,
            owner_address,
            asset_metadata,
            amount
        );
        
        let fa = primary_fungible_store::withdraw(owner, asset_metadata, amount);
        fungible_asset::burn(&config.burn_ref, fa);
    }

    /// View functions
    #[view]
    public fun get_fractional_asset_info(asset_metadata: Object<Metadata>): (address, u64, u64, u64, u64) acquires FractionalAssetConfig {
        let asset_address = object::object_address(&asset_metadata);
        let config = borrow_global<FractionalAssetConfig>(asset_address);
        (
            object::object_address(&config.land_token_object),
            config.total_supply,
            config.fraction_per_acre,
            config.creation_fee_paid,
            config.price_per_token
        )
    }

    #[view]
    public fun get_user_balance(user: address, asset_metadata: Object<Metadata>): u64 {
        primary_fungible_store::balance(user, asset_metadata)
    }

    #[view]
    public fun get_total_supply(asset_metadata: Object<Metadata>): u64 acquires FractionalAssetConfig {
        let asset_address = object::object_address(&asset_metadata);
        let config = borrow_global<FractionalAssetConfig>(asset_address);
        config.total_supply
    }

    #[view]
    public fun get_token_price(asset_metadata: Object<Metadata>): u64 acquires FractionalAssetConfig {
        let asset_address = object::object_address(&asset_metadata);
        let config = borrow_global<FractionalAssetConfig>(asset_address);
        config.price_per_token
    }
}
