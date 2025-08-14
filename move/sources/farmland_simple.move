module landledger_addr::farmland_simple {
    use std::string::{Self, String};
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::table::{Self, Table};

    /// Error codes
    const E_INSUFFICIENT_BALANCE: u64 = 1001;
    const E_FARM_NOT_FOUND: u64 = 1002;
    const E_NOT_AUTHORIZED: u64 = 1003;
    const E_INSUFFICIENT_TOKENS: u64 = 1004;
    const E_INVALID_AMOUNT: u64 = 1005;

    /// Enhanced farm struct with investor tracking
    struct Farm has store {
        id: u64,
        owner: address,
        name: String,
        location: String,
        area_acres: u64,
        total_tokens: u64,
        tokens_sold: u64,
        price_per_token: u64, // in Octas (1 APT = 100,000,000 octas)
        land_id: String,
        geo_tag: String,
        proof_hash: String,
        total_raised: u64, // Total APT raised
        investors: Table<address, u64>, // investor -> tokens owned
        investor_list: vector<address>, // List of all investors
    }

    /// Registry resource with treasury
    struct FarmRegistry has key {
        farms: vector<Farm>,
        next_id: u64,
        platform_fee_bps: u64, // Platform fee in basis points (250 = 2.5%)
        treasury_balance: u64, // Platform fees collected
    }

    /// Individual investor record
    struct InvestorRecord has key {
        investments: Table<u64, u64>, // farm_id -> tokens owned
        total_invested: u64, // Total APT invested
        total_income_received: u64, // Total income received
    }

    /// Events
    #[event]
    struct FarmCreated has drop, store {
        farm_id: u64,
        owner: address,
        name: String,
        total_tokens: u64,
        price_per_token: u64,
        creation_fee_paid: u64,
        timestamp: u64,
    }

    #[event]
    struct InvestmentMade has drop, store {
        farm_id: u64,
        investor: address,
        farm_owner: address,
        tokens_purchased: u64,
        amount_paid: u64,
        platform_fee: u64,
        timestamp: u64,
    }

    #[event]
    struct IncomeDistributed has drop, store {
        farm_id: u64,
        farm_owner: address,
        total_income: u64,
        investors_count: u64,
        timestamp: u64,
    }

    /// One-time registry initializer
    public entry fun init(account: &signer) {
        let creation_fee = 1000000; // 0.01 APT for registry creation
        assert_sufficient_balance(account, creation_fee);
        
        // Pay creation fee
        let fee_coins = coin::withdraw<AptosCoin>(account, creation_fee);
        coin::destroy_zero(fee_coins);
        
        move_to(account, FarmRegistry {
            farms: vector::empty<Farm>(),
            next_id: 0,
            platform_fee_bps: 250, // 2.5% platform fee
            treasury_balance: 0,
        });
    }

    /// Create a new farm listing with real fee payment
    public entry fun create_farm(
        farmer: &signer,
        name: String,
        location: String,
        area_acres: u64,
        total_tokens: u64,
        price_per_token: u64,
        land_id: String,
        geo_tag: String,
        proof_hash: String
    ) acquires FarmRegistry {
        let addr = signer::address_of(farmer);
        
        // Calculate creation fee (0.1 APT + 0.01 APT per acre)
        let base_fee = 10000000; // 0.1 APT
        let area_fee = area_acres * 1000000; // 0.01 APT per acre
        let creation_fee = base_fee + area_fee;
        
        // REAL WALLET CHECK: Ensure sufficient balance
        assert_sufficient_balance(farmer, creation_fee);
        
        // Initialize registry if it doesn't exist
        if (!exists<FarmRegistry>(addr)) {
            init(farmer);
        };
        
        let registry = borrow_global_mut<FarmRegistry>(addr);
        
        // REAL TRANSACTION: Deduct creation fee from farmer's wallet
        coin::transfer<AptosCoin>(farmer, @landledger_addr, creation_fee);
        registry.treasury_balance = registry.treasury_balance + creation_fee;

        let new_farm = Farm {
            id: registry.next_id,
            owner: addr,
            name,
            location,
            area_acres,
            total_tokens,
            tokens_sold: 0,
            price_per_token,
            land_id,
            geo_tag,
            proof_hash,
            total_raised: 0,
            investors: table::new(),
            investor_list: vector::empty(),
        };

        vector::push_back(&mut registry.farms, new_farm);
        
        // Emit event
        event::emit(FarmCreated {
            farm_id: registry.next_id,
            owner: addr,
            name,
            total_tokens,
            price_per_token,
            creation_fee_paid: creation_fee,
            timestamp: timestamp::now_seconds(),
        });
        
        registry.next_id = registry.next_id + 1;
    }

    /// Invest in farm with real APT transfer and fee collection
    public entry fun invest_in_farm(
        investor: &signer,
        farm_owner: address,
        farm_index: u64,
        token_amount: u64
    ) acquires FarmRegistry, InvestorRecord {
        let investor_address = signer::address_of(investor);
        
        // Ensure farm owner registry exists
        assert!(exists<FarmRegistry>(farm_owner), E_FARM_NOT_FOUND);
        
        let registry = borrow_global_mut<FarmRegistry>(farm_owner);
        assert!(farm_index < vector::length(&registry.farms), E_FARM_NOT_FOUND);
        
        let farm = vector::borrow_mut(&mut registry.farms, farm_index);
        assert!(farm.tokens_sold + token_amount <= farm.total_tokens, E_INSUFFICIENT_TOKENS);
        assert!(token_amount > 0, E_INVALID_AMOUNT);

        let total_cost = token_amount * farm.price_per_token;
        let platform_fee = (total_cost * registry.platform_fee_bps) / 10000;
        let farmer_proceeds = total_cost - platform_fee;

        // REAL WALLET CHECK: Ensure investor has sufficient balance
        assert_sufficient_balance(investor, total_cost);

        // REAL TRANSACTIONS: Transfer APT
        coin::transfer<AptosCoin>(investor, farm.owner, farmer_proceeds);
        coin::transfer<AptosCoin>(investor, @landledger_addr, platform_fee);
        
        // Update platform treasury
        registry.treasury_balance = registry.treasury_balance + platform_fee;

        // Update farm data
        farm.tokens_sold = farm.tokens_sold + token_amount;
        farm.total_raised = farm.total_raised + farmer_proceeds;
        
        // Track investor
        if (!table::contains(&farm.investors, investor_address)) {
            table::add(&mut farm.investors, investor_address, token_amount);
            vector::push_back(&mut farm.investor_list, investor_address);
        } else {
            let current_tokens = table::borrow_mut(&mut farm.investors, investor_address);
            *current_tokens = *current_tokens + token_amount;
        };
        
        // Update investor record
        if (!exists<InvestorRecord>(investor_address)) {
            move_to(investor, InvestorRecord {
                investments: table::new(),
                total_invested: 0,
                total_income_received: 0,
            });
        };
        
        let investor_record = borrow_global_mut<InvestorRecord>(investor_address);
        if (!table::contains(&investor_record.investments, farm.id)) {
            table::add(&mut investor_record.investments, farm.id, token_amount);
        } else {
            let current_investment = table::borrow_mut(&mut investor_record.investments, farm.id);
            *current_investment = *current_investment + token_amount;
        };
        investor_record.total_invested = investor_record.total_invested + total_cost;
        
        // Emit event
        event::emit(InvestmentMade {
            farm_id: farm.id,
            investor: investor_address,
            farm_owner: farm.owner,
            tokens_purchased: token_amount,
            amount_paid: total_cost,
            platform_fee,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Distribute income to investors with real APT transfers
    public entry fun distribute_income(
        farmer: &signer,
        farm_index: u64,
        total_income: u64
    ) acquires FarmRegistry, InvestorRecord {
        let addr = signer::address_of(farmer);
        
        assert!(exists<FarmRegistry>(addr), E_FARM_NOT_FOUND);
        
        let registry = borrow_global<FarmRegistry>(addr);
        assert!(farm_index < vector::length(&registry.farms), E_FARM_NOT_FOUND);
        
        let farm = vector::borrow(&registry.farms, farm_index);
        assert!(farm.owner == addr, E_NOT_AUTHORIZED);
        assert!(farm.tokens_sold > 0, E_INSUFFICIENT_TOKENS);
        assert!(total_income > 0, E_INVALID_AMOUNT);
        
        // REAL WALLET CHECK: Ensure farmer has sufficient balance
        assert_sufficient_balance(farmer, total_income);
        
        // Calculate income per token
        let income_per_token = total_income / farm.tokens_sold;
        
        // Distribute to each investor
        let investor_count = vector::length(&farm.investor_list);
        let i = 0;
        while (i < investor_count) {
            let investor_addr = *vector::borrow(&farm.investor_list, i);
            let tokens_owned = *table::borrow(&farm.investors, investor_addr);
            let investor_income = tokens_owned * income_per_token;
            
            if (investor_income > 0) {
                // REAL TRANSACTION: Transfer income to investor
                coin::transfer<AptosCoin>(farmer, investor_addr, investor_income);
                
                // Update investor record
                if (exists<InvestorRecord>(investor_addr)) {
                    let investor_record = borrow_global_mut<InvestorRecord>(investor_addr);
                    investor_record.total_income_received = investor_record.total_income_received + investor_income;
                };
            };
            
            i = i + 1;
        };
        
        // Emit event
        event::emit(IncomeDistributed {
            farm_id: farm.id,
            farm_owner: addr,
            total_income,
            investors_count: investor_count,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Ensure caller has sufficient APT balance
    fun assert_sufficient_balance(account: &signer, required_amount: u64) {
        let account_addr = signer::address_of(account);
        let balance = coin::balance<AptosCoin>(account_addr);
        assert!(balance >= required_amount, E_INSUFFICIENT_BALANCE);
    }

    /// View functions
    #[view]
    public fun get_farm_with_investors(owner: address, farm_index: u64): (u64, address, String, String, u64, u64, u64, u64, String, String, String, u64, vector<address>) acquires FarmRegistry {
        let registry = borrow_global<FarmRegistry>(owner);
        let farm = vector::borrow(&registry.farms, farm_index);
        (
            farm.id,
            farm.owner,
            farm.name,
            farm.location,
            farm.area_acres,
            farm.total_tokens,
            farm.tokens_sold,
            farm.price_per_token,
            farm.land_id,
            farm.geo_tag,
            farm.proof_hash,
            farm.total_raised,
            farm.investor_list
        )
    }

    #[view]
    public fun get_investor_tokens(farm_owner: address, farm_index: u64, investor: address): u64 acquires FarmRegistry {
        let registry = borrow_global<FarmRegistry>(farm_owner);
        let farm = vector::borrow(&registry.farms, farm_index);
        if (table::contains(&farm.investors, investor)) {
            *table::borrow(&farm.investors, investor)
        } else {
            0
        }
    }

    #[view]
    public fun get_investor_record(investor: address): (u64, u64) acquires InvestorRecord {
        if (exists<InvestorRecord>(investor)) {
            let record = borrow_global<InvestorRecord>(investor);
            (record.total_invested, record.total_income_received)
        } else {
            (0, 0)
        }
    }

    #[view]
    public fun get_platform_stats(owner: address): (u64, u64) acquires FarmRegistry {
        if (exists<FarmRegistry>(owner)) {
            let registry = borrow_global<FarmRegistry>(owner);
            (registry.platform_fee_bps, registry.treasury_balance)
        } else {
            (0, 0)
        }
    }
}
