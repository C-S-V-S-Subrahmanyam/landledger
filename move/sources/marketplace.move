module landledger_addr::marketplace {
    use std::signer;
    use std::vector;
    use std::option::{Self, Option};
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::fungible_asset::Metadata;
    use aptos_framework::primary_fungible_store;
    use aptos_framework::table::{Self, Table};

    /// Error codes
    const E_LISTING_NOT_FOUND: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_INSUFFICIENT_PAYMENT: u64 = 3;
    const E_NOT_AUTHORIZED: u64 = 4;
    const E_INVALID_AMOUNT: u64 = 5;
    const E_LISTING_EXPIRED: u64 = 6;
    const E_CANNOT_BUY_OWN_LISTING: u64 = 7;
    const E_INSUFFICIENT_TOKEN_BALANCE: u64 = 8;

    /// Listing structure with escrow
    struct Listing has store {
        listing_id: u64,
        seller: address,
        asset_metadata: address,
        amount: u64,
        price_per_token: u64, // in APT (octas)
        created_at: u64,
        expires_at: Option<u64>,
        is_active: bool,
        tokens_escrowed: bool, // Track if tokens are held in escrow
    }

    /// Marketplace configuration with treasury
    struct MarketplaceConfig has key {
        listings: Table<u64, Listing>,
        next_listing_id: u64,
        total_listings: u64,
        platform_fee_bps: u64, // basis points (e.g., 250 = 2.5%)
        fee_recipient: address,
        treasury_balance: u64, // APT held for transactions
    }

    /// Escrow for holding tokens during listing
    struct TokenEscrow has key {
        escrowed_tokens: Table<u64, u64>, // listing_id -> amount
    }

    /// User's active listings
    struct UserListings has key {
        listing_ids: vector<u64>,
    }

    /// Events
    #[event]
    struct ListingCreated has drop, store {
        listing_id: u64,
        seller: address,
        asset_metadata: address,
        amount: u64,
        price_per_token: u64,
        expires_at: Option<u64>,
        timestamp: u64,
    }

    #[event]
    struct ListingPurchased has drop, store {
        listing_id: u64,
        seller: address,
        buyer: address,
        asset_metadata: address,
        amount: u64,
        total_price: u64,
        platform_fee: u64,
        seller_proceeds: u64,
        timestamp: u64,
    }

    #[event]
    struct ListingCancelled has drop, store {
        listing_id: u64,
        seller: address,
        refunded_amount: u64,
        timestamp: u64,
    }

    /// Initialize the marketplace
    fun init_module(deployer: &signer) {
        move_to(deployer, MarketplaceConfig {
            listings: table::new(),
            next_listing_id: 1,
            total_listings: 0,
            platform_fee_bps: 250, // 2.5%
            fee_recipient: signer::address_of(deployer),
            treasury_balance: 0,
        });

        move_to(deployer, TokenEscrow {
            escrowed_tokens: table::new(),
        });
    }

    /// Create a new listing with token escrow
    public entry fun create_listing(
        seller: &signer,
        asset_metadata: Object<Metadata>,
        amount: u64,
        price_per_token: u64,
        duration_seconds: Option<u64>,
    ) acquires MarketplaceConfig, UserListings, TokenEscrow {
        let seller_address = signer::address_of(seller);
        let asset_address = object::object_address(&asset_metadata);
        
        assert!(amount > 0, E_INVALID_AMOUNT);
        assert!(price_per_token > 0, E_INVALID_AMOUNT);
        
        // REAL WALLET CHECK: Verify seller has enough tokens in their wallet
        let seller_balance = primary_fungible_store::balance(seller_address, asset_metadata);
        assert!(seller_balance >= amount, E_INSUFFICIENT_TOKEN_BALANCE);
        
        let config = borrow_global_mut<MarketplaceConfig>(@landledger_addr);
        let escrow = borrow_global_mut<TokenEscrow>(@landledger_addr);
        let listing_id = config.next_listing_id;
        let current_time = timestamp::now_seconds();
        
        let expires_at = if (option::is_some(&duration_seconds)) {
            option::some(current_time + option::extract(&mut duration_seconds))
        } else {
            option::none()
        };

        // REAL TRANSACTION: Transfer tokens from seller to marketplace escrow
        primary_fungible_store::transfer(seller, asset_metadata, @landledger_addr, amount);
        
        let listing = Listing {
            listing_id,
            seller: seller_address,
            asset_metadata: asset_address,
            amount,
            price_per_token,
            created_at: current_time,
            expires_at,
            is_active: true,
            tokens_escrowed: true,
        };
        
        table::add(&mut config.listings, listing_id, listing);
        table::add(&mut escrow.escrowed_tokens, listing_id, amount);
        config.next_listing_id = config.next_listing_id + 1;
        config.total_listings = config.total_listings + 1;
        
        // Update user listings
        if (!exists<UserListings>(seller_address)) {
            move_to(seller, UserListings {
                listing_ids: vector::empty(),
            });
        };
        let user_listings = borrow_global_mut<UserListings>(seller_address);
        vector::push_back(&mut user_listings.listing_ids, listing_id);
        
        // Emit event
        event::emit(ListingCreated {
            listing_id,
            seller: seller_address,
            asset_metadata: asset_address,
            amount,
            price_per_token,
            expires_at,
            timestamp: current_time,
        });
    }

    /// Purchase from a listing with real APT transfer
    public entry fun purchase_listing(
        buyer: &signer,
        listing_id: u64,
        amount_to_buy: u64,
    ) acquires MarketplaceConfig, TokenEscrow {
        let buyer_address = signer::address_of(buyer);
        let config = borrow_global_mut<MarketplaceConfig>(@landledger_addr);
        let escrow = borrow_global_mut<TokenEscrow>(@landledger_addr);
        
        assert!(table::contains(&config.listings, listing_id), E_LISTING_NOT_FOUND);
        let listing = table::borrow_mut(&mut config.listings, listing_id);
        assert!(listing.is_active, E_LISTING_NOT_FOUND);
        assert!(listing.seller != buyer_address, E_CANNOT_BUY_OWN_LISTING);
        assert!(amount_to_buy > 0 && amount_to_buy <= listing.amount, E_INVALID_AMOUNT);
        
        // Check if listing has expired
        if (option::is_some(&listing.expires_at)) {
            let expires_at = *option::borrow(&listing.expires_at);
            assert!(timestamp::now_seconds() <= expires_at, E_LISTING_EXPIRED);
        };
        
        let total_price = amount_to_buy * listing.price_per_token;
        let platform_fee = (total_price * config.platform_fee_bps) / 10000;
        let seller_proceeds = total_price - platform_fee;
        
        // REAL WALLET CHECK: Verify buyer has enough APT in their wallet
        let buyer_balance = coin::balance<AptosCoin>(buyer_address);
        assert!(buyer_balance >= total_price, E_INSUFFICIENT_PAYMENT);
        
        // REAL TRANSACTIONS: Transfer APT from buyer wallet
        coin::transfer<AptosCoin>(buyer, listing.seller, seller_proceeds);
        coin::transfer<AptosCoin>(buyer, config.fee_recipient, platform_fee);
        
        // REAL TRANSACTION: Transfer tokens from escrow to buyer
        let asset_metadata = object::address_to_object<Metadata>(listing.asset_metadata);
        primary_fungible_store::transfer_with_ref(
            &primary_fungible_store::create_transfer_ref_with_signer(@landledger_addr),
            @landledger_addr,
            buyer_address,
            asset_metadata,
            amount_to_buy
        );
        
        // Update escrow and listing
        let escrowed_amount = table::borrow_mut(&mut escrow.escrowed_tokens, listing_id);
        *escrowed_amount = *escrowed_amount - amount_to_buy;
        
        listing.amount = listing.amount - amount_to_buy;
        if (listing.amount == 0) {
            listing.is_active = false;
            table::remove(&mut escrow.escrowed_tokens, listing_id);
        };
        
        // Update treasury balance
        config.treasury_balance = config.treasury_balance + platform_fee;
        
        // Emit event
        event::emit(ListingPurchased {
            listing_id,
            seller: listing.seller,
            buyer: buyer_address,
            asset_metadata: listing.asset_metadata,
            amount: amount_to_buy,
            total_price,
            platform_fee,
            seller_proceeds,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Cancel a listing and return tokens to seller
    public entry fun cancel_listing(
        seller: &signer,
        listing_id: u64,
    ) acquires MarketplaceConfig, TokenEscrow {
        let seller_address = signer::address_of(seller);
        let config = borrow_global_mut<MarketplaceConfig>(@landledger_addr);
        let escrow = borrow_global_mut<TokenEscrow>(@landledger_addr);
        
        assert!(table::contains(&config.listings, listing_id), E_LISTING_NOT_FOUND);
        let listing = table::borrow_mut(&mut config.listings, listing_id);
        assert!(listing.seller == seller_address, E_NOT_AUTHORIZED);
        assert!(listing.is_active, E_LISTING_NOT_FOUND);
        
        // REAL TRANSACTION: Return escrowed tokens to seller
        if (listing.tokens_escrowed && table::contains(&escrow.escrowed_tokens, listing_id)) {
            let escrowed_amount = table::remove(&mut escrow.escrowed_tokens, listing_id);
            let asset_metadata = object::address_to_object<Metadata>(listing.asset_metadata);
            
            primary_fungible_store::transfer_with_ref(
                &primary_fungible_store::create_transfer_ref_with_signer(@landledger_addr),
                @landledger_addr,
                seller_address,
                asset_metadata,
                escrowed_amount
            );
            
            listing.is_active = false;
            
            // Emit event
            event::emit(ListingCancelled {
                listing_id,
                seller: seller_address,
                refunded_amount: escrowed_amount,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// View functions
    #[view]
    public fun get_listing(listing_id: u64): (u64, address, address, u64, u64, u64, Option<u64>, bool) acquires MarketplaceConfig {
        let config = borrow_global<MarketplaceConfig>(@landledger_addr);
        assert!(table::contains(&config.listings, listing_id), E_LISTING_NOT_FOUND);
        let listing = table::borrow(&config.listings, listing_id);
        (
            listing.listing_id,
            listing.seller,
            listing.asset_metadata,
            listing.amount,
            listing.price_per_token,
            listing.created_at,
            listing.expires_at,
            listing.is_active
        )
    }

    #[view]
    public fun get_marketplace_stats(): (u64, u64, u64, address, u64) acquires MarketplaceConfig {
        let config = borrow_global<MarketplaceConfig>(@landledger_addr);
        (
            config.next_listing_id - 1,
            config.total_listings,
            config.platform_fee_bps,
            config.fee_recipient,
            config.treasury_balance
        )
    }

    #[view]
    public fun get_escrowed_amount(listing_id: u64): u64 acquires TokenEscrow {
        let escrow = borrow_global<TokenEscrow>(@landledger_addr);
        if (table::contains(&escrow.escrowed_tokens, listing_id)) {
            *table::borrow(&escrow.escrowed_tokens, listing_id)
        } else {
            0
        }
    }
}
