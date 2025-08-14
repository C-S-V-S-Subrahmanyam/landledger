module landledger_addr::income_distribution {
    use std::signer;
    use std::vector;
    use std::string::String;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::fungible_asset::Metadata;
    use aptos_framework::primary_fungible_store;
    use aptos_framework::table::{Self, Table};
    use landledger_addr::land_nft::LandMetadata;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INSUFFICIENT_FUNDS: u64 = 2;
    const E_INVALID_AMOUNT: u64 = 3;
    const E_DISTRIBUTION_NOT_FOUND: u64 = 4;
    const E_ALREADY_CLAIMED: u64 = 5;
    const E_NO_TOKENS_HELD: u64 = 6;
    const E_INSUFFICIENT_TREASURY: u64 = 7;

    /// Income distribution record with real treasury
    struct IncomeDistribution has store {
        distribution_id: u64,
        land_token_object: address,
        fractional_asset_metadata: address,
        total_income: u64, // in APT (octas)
        income_per_token: u64, // in APT (octas)
        distribution_date: u64,
        description: String,
        is_active: bool,
        total_claimed: u64,
        treasury_deposited: u64, // Actual APT deposited for distribution
        claims: Table<address, bool>, // user_address -> claimed
    }

    /// Contract configuration with treasury
    struct IncomeDistributionConfig has key {
        distributions: Table<u64, IncomeDistribution>,
        next_distribution_id: u64,
        total_distributions: u64,
        land_to_distributions: Table<address, vector<u64>>, // land_address -> distribution_ids
        treasury_balance: u64, // Total APT held for distributions
    }

    /// User claim history
    struct UserClaims has key {
        claimed_distributions: vector<u64>,
        total_claimed_amount: u64,
    }

    /// Events
    #[event]
    struct IncomeDistributionCreated has drop, store {
        distribution_id: u64,
        land_token_object: address,
        fractional_asset_metadata: address,
        total_income: u64,
        income_per_token: u64,
        treasury_deposited: u64,
        description: String,
        timestamp: u64,
    }

    #[event]
    struct IncomeClaimed has drop, store {
        distribution_id: u64,
        user: address,
        tokens_held: u64,
        income_claimed: u64,
        timestamp: u64,
    }

    /// Initialize the module
    fun init_module(deployer: &signer) {
        move_to(deployer, IncomeDistributionConfig {
            distributions: table::new(),
            next_distribution_id: 1,
            total_distributions: 0,
            land_to_distributions: table::new(),
            treasury_balance: 0,
        });
    }

    /// Create a new income distribution with real APT deposit
    public entry fun create_income_distribution(
        distributor: &signer,
        land_token_object: Object<LandMetadata>,
        fractional_asset_metadata: Object<Metadata>,
        total_income: u64,
        description: String,
    ) acquires IncomeDistributionConfig {
        let distributor_address = signer::address_of(distributor);
        let land_address = object::object_address(&land_token_object);
        let asset_address = object::object_address(&fractional_asset_metadata);
        
        // Verify ownership of the land NFT
        assert!(object::is_owner(land_token_object, distributor_address), E_NOT_AUTHORIZED);
        assert!(total_income > 0, E_INVALID_AMOUNT);
        
        // REAL WALLET CHECK: Verify distributor has enough APT in their wallet
        let balance = coin::balance<AptosCoin>(distributor_address);
        assert!(balance >= total_income, E_INSUFFICIENT_FUNDS);
        
        // Get total supply of fractional tokens
        let total_supply = landledger_addr::fractional_token::get_total_supply(fractional_asset_metadata);
        let income_per_token = total_income / total_supply;
        
        let config = borrow_global_mut<IncomeDistributionConfig>(@landledger_addr);
        let distribution_id = config.next_distribution_id;
        
        // REAL TRANSACTION: Transfer APT from distributor to contract treasury
        coin::transfer<AptosCoin>(distributor, @landledger_addr, total_income);
        config.treasury_balance = config.treasury_balance + total_income;
        
        let distribution = IncomeDistribution {
            distribution_id,
            land_token_object: land_address,
            fractional_asset_metadata: asset_address,
            total_income,
            income_per_token,
            distribution_date: timestamp::now_seconds(),
            description,
            is_active: true,
            total_claimed: 0,
            treasury_deposited: total_income,
            claims: table::new(),
        };
        
        table::add(&mut config.distributions, distribution_id, distribution);
        config.next_distribution_id = config.next_distribution_id + 1;
        config.total_distributions = config.total_distributions + 1;
        
        // Track distribution for this land
        if (!table::contains(&config.land_to_distributions, land_address)) {
            table::add(&mut config.land_to_distributions, land_address, vector::empty());
        };
        let land_distributions = table::borrow_mut(&mut config.land_to_distributions, land_address);
        vector::push_back(land_distributions, distribution_id);
        
        // Emit event
        event::emit(IncomeDistributionCreated {
            distribution_id,
            land_token_object: land_address,
            fractional_asset_metadata: asset_address,
            total_income,
            income_per_token,
            treasury_deposited: total_income,
            description,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Claim income from a distribution with real APT transfer
    public entry fun claim_income(
        user: &signer,
        distribution_id: u64,
    ) acquires IncomeDistributionConfig, UserClaims {
        let user_address = signer::address_of(user);
        let config = borrow_global_mut<IncomeDistributionConfig>(@landledger_addr);
        
        assert!(table::contains(&config.distributions, distribution_id), E_DISTRIBUTION_NOT_FOUND);
        let distribution = table::borrow_mut(&mut config.distributions, distribution_id);
        assert!(distribution.is_active, E_DISTRIBUTION_NOT_FOUND);
        assert!(!table::contains(&distribution.claims, user_address), E_ALREADY_CLAIMED);
        
        // REAL WALLET CHECK: Verify user holds fractional tokens
        let asset_metadata = object::address_to_object<Metadata>(distribution.fractional_asset_metadata);
        let tokens_held = primary_fungible_store::balance(user_address, asset_metadata);
        assert!(tokens_held > 0, E_NO_TOKENS_HELD);
        
        // Calculate income to claim
        let income_to_claim = tokens_held * distribution.income_per_token;
        
        // Verify treasury has sufficient funds
        assert!(config.treasury_balance >= income_to_claim, E_INSUFFICIENT_TREASURY);
        
        // Mark as claimed
        table::add(&mut distribution.claims, user_address, true);
        distribution.total_claimed = distribution.total_claimed + income_to_claim;
        
        // REAL TRANSACTION: Transfer APT from treasury to user wallet
        coin::transfer<AptosCoin>(@landledger_addr, user_address, income_to_claim);
        config.treasury_balance = config.treasury_balance - income_to_claim;
        
        // Update user claims
        if (!exists<UserClaims>(user_address)) {
            move_to(user, UserClaims {
                claimed_distributions: vector::empty(),
                total_claimed_amount: 0,
            });
        };
        let user_claims = borrow_global_mut<UserClaims>(user_address);
        vector::push_back(&mut user_claims.claimed_distributions, distribution_id);
        user_claims.total_claimed_amount = user_claims.total_claimed_amount + income_to_claim;
        
        // Emit event
        event::emit(IncomeClaimed {
            distribution_id,
            user: user_address,
            tokens_held,
            income_claimed: income_to_claim,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Batch claim multiple distributions
    public entry fun batch_claim_income(
        user: &signer,
        distribution_ids: vector<u64>,
    ) acquires IncomeDistributionConfig, UserClaims {
        let len = vector::length(&distribution_ids);
        let i = 0;
        while (i < len) {
            let distribution_id = *vector::borrow(&distribution_ids, i);
            claim_income(user, distribution_id);
            i = i + 1;
        };
    }

    /// Emergency function to withdraw unclaimed funds (admin only)
    public entry fun emergency_withdraw(
        admin: &signer,
        amount: u64,
    ) acquires IncomeDistributionConfig {
        let admin_address = signer::address_of(admin);
        assert!(admin_address == @landledger_addr, E_NOT_AUTHORIZED);
        
        let config = borrow_global_mut<IncomeDistributionConfig>(@landledger_addr);
        assert!(config.treasury_balance >= amount, E_INSUFFICIENT_TREASURY);
        
        // REAL TRANSACTION: Transfer APT from treasury to admin
        coin::transfer<AptosCoin>(@landledger_addr, admin_address, amount);
        config.treasury_balance = config.treasury_balance - amount;
    }

    /// View functions
    #[view]
    public fun get_distribution_info(distribution_id: u64): (u64, address, address, u64, u64, u64, String, bool, u64, u64) acquires IncomeDistributionConfig {
        let config = borrow_global<IncomeDistributionConfig>(@landledger_addr);
        assert!(table::contains(&config.distributions, distribution_id), E_DISTRIBUTION_NOT_FOUND);
        let distribution = table::borrow(&config.distributions, distribution_id);
        (
            distribution.distribution_id,
            distribution.land_token_object,
            distribution.fractional_asset_metadata,
            distribution.total_income,
            distribution.income_per_token,
            distribution.distribution_date,
            distribution.description,
            distribution.is_active,
            distribution.total_claimed,
            distribution.treasury_deposited
        )
    }

    #[view]
    public fun get_treasury_balance(): u64 acquires IncomeDistributionConfig {
        let config = borrow_global<IncomeDistributionConfig>(@landledger_addr);
        config.treasury_balance
    }

    #[view]
    public fun get_claimable_income(distribution_id: u64, user: address): u64 acquires IncomeDistributionConfig {
        let config = borrow_global<IncomeDistributionConfig>(@landledger_addr);
        if (table::contains(&config.distributions, distribution_id)) {
            let distribution = table::borrow(&config.distributions, distribution_id);
            if (table::contains(&distribution.claims, user)) {
                0 // Already claimed
            } else {
                let asset_metadata = object::address_to_object<Metadata>(distribution.fractional_asset_metadata);
                let tokens_held = primary_fungible_store::balance(user, asset_metadata);
                tokens_held * distribution.income_per_token
            }
        } else {
            0
        }
    }

    #[view]
    public fun get_user_total_claims(user: address): (vector<u64>, u64) acquires UserClaims {
        if (exists<UserClaims>(user)) {
            let user_claims = borrow_global<UserClaims>(user);
            (user_claims.claimed_distributions, user_claims.total_claimed_amount)
        } else {
            (vector::empty(), 0)
        }
    }
}
