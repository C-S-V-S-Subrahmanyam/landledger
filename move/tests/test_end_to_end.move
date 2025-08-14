#[test_only]
module landledger_addr::test_end_to_end {
    use std::string;
    use std::signer;

    use landledger_addr::farmland_simple;

    #[test(user = @0x2161395c0ca6a820e5c864436a90c863439a4d3370b8ce49987d58efc9ad44fe)]
    fun test_farmland_initialization(user: &signer) {
        // Initialize farmland module
        farmland_simple::init_module_for_test(user);
        
        // Initialize registry for user
        farmland_simple::init(user);
        
        // Check if user has farms (should be 0)
        assert!(farmland_simple::has_registry(signer::address_of(user)), 1);
        
        // Get farm count (should be 0)
        let farm_count = farmland_simple::get_farm_count(signer::address_of(user));
        assert!(farm_count == 0, 2);
    }

    #[test(user = @0x2161395c0ca6a820e5c864436a90c863439a4d3370b8ce49987d58efc9ad44fe)]
    fun test_view_functions(user: &signer) {
        let addr = signer::address_of(user);
        
        // Test functions when no registry exists
        assert!(!farmland_simple::has_registry(addr), 1);
        assert!(farmland_simple::get_farm_count(addr) == 0, 2);
    }
}
