#[test_only]
module landledger_addr::test_farmland_simple {
    use std::string;
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::aptos_account;

    use landledger_addr::farmland_simple;

    #[test(farmer = @0x100, investor = @0x200, aptos_framework = @0x1)]
    fun test_end_to_end(farmer: &signer, investor: &signer, aptos_framework: &signer) {
        // Initialize the coin and give both accounts some APT
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        
        let farmer_addr = signer::address_of(farmer);
        let investor_addr = signer::address_of(investor);
        
        // Create accounts and fund them
        aptos_account::create_account_for_test(farmer_addr);
        aptos_account::create_account_for_test(investor_addr);
        
        // Mint some APT for testing (100 APT each)
        let farmer_coins = coin::mint<AptosCoin>(100_00000000, &mint_cap); // 100 APT in octas
        let investor_coins = coin::mint<AptosCoin>(100_00000000, &mint_cap); // 100 APT in octas
        
        coin::deposit(farmer_addr, farmer_coins);
        coin::deposit(investor_addr, investor_coins);

        // Test farm creation
        farmland_simple::create_farm(
            farmer,
            string::utf8(b"Green Valley Farm"),
            string::utf8(b"Iowa, USA"),
            50, // 50 acres
            1000, // 1000 tokens total
            50000000, // 0.5 APT per token (in octas)
            string::utf8(b"LAND001"),
            string::utf8(b"41.2033,-95.9897"),
            string::utf8(b"proof_hash_123")
        );

        // Verify farm was created
        assert!(farmland_simple::has_registry(farmer_addr), 1);
        assert!(farmland_simple::get_farm_count(farmer_addr) == 1, 2);

        // Test investment
        farmland_simple::invest_in_farm(
            investor,
            farmer_addr,
            0, // first farm (index 0)
            10 // buy 10 tokens
        );

        // Verify investment
        let farm = farmland_simple::get_farm(farmer_addr, 0);
        assert!(farm.tokens_sold == 10, 3);

        // Test income distribution
        farmland_simple::distribute_income(
            farmer,
            0, // first farm
            1000000000 // 10 APT income to distribute (in octas)
        );

        // Clean up
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(farmer = @0x100, aptos_framework = @0x1)]
    fun test_multiple_farms(farmer: &signer, aptos_framework: &signer) {
        // Initialize the coin
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        
        let farmer_addr = signer::address_of(farmer);
        aptos_account::create_account_for_test(farmer_addr);
        
        let farmer_coins = coin::mint<AptosCoin>(100_00000000, &mint_cap);
        coin::deposit(farmer_addr, farmer_coins);

        // Create first farm
        farmland_simple::create_farm(
            farmer,
            string::utf8(b"Farm 1"),
            string::utf8(b"Location 1"),
            25,
            500,
            100000000, // 1 APT per token
            string::utf8(b"LAND001"),
            string::utf8(b"40.0,-95.0"),
            string::utf8(b"proof1")
        );

        // Create second farm
        farmland_simple::create_farm(
            farmer,
            string::utf8(b"Farm 2"),
            string::utf8(b"Location 2"),
            75,
            1500,
            50000000, // 0.5 APT per token
            string::utf8(b"LAND002"),
            string::utf8(b"41.0,-96.0"),
            string::utf8(b"proof2")
        );

        // Verify both farms exist
        assert!(farmland_simple::get_farm_count(farmer_addr) == 2, 1);

        // Verify farm details
        let farm1 = farmland_simple::get_farm(farmer_addr, 0);
        let farm2 = farmland_simple::get_farm(farmer_addr, 1);
        
        assert!(farm1.total_tokens == 500, 2);
        assert!(farm2.total_tokens == 1500, 3);
        assert!(farm1.price_per_token == 100000000, 4);
        assert!(farm2.price_per_token == 50000000, 5);

        // Clean up
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}
