#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

#[global_allocator]
static ALLOC: mini_alloc::MiniAlloc = mini_alloc::MiniAlloc::INIT;

use stylus_sdk::prelude::*;
use stylus_sdk::tx; // v0.3.0 gas_price 
use stylus_sdk::alloy_primitives::U256;

#[entrypoint]
pub struct GhostTx;

impl stylus_sdk::storage::StorageType for GhostTx {
    type Wraps<'a> = Self;
    type WrapsMut<'a> = Self;
    unsafe fn new(_: stylus_sdk::alloy_primitives::Uint<256, 4>, _: u8) -> Self { Self }
    fn load<'s>(self) -> Self::Wraps<'s> { self }
    fn load_mut<'s>(self) -> Self::WrapsMut<'s> { self }
}

impl stylus_sdk::abi::Router<Self> for GhostTx {
    type Storage = Self;
    fn route(_storage: &mut Self, selector: u32, _input: &[u8]) -> Option<Result<Vec<u8>, Vec<u8>>> {
        
        // execute_intent(bytes,uint256,bytes32) selector
        if selector == 0x4879208d { 
            let current_gas = tx::gas_price();
            
            // If Gas > 0.1 gwei (100,000,000 wei) will return an error
            if current_gas > U256::from(100_000_000) {
                return Some(Err("GAS_TOO_HIGH".into()));
            }
            
            return Some(Ok(vec![1])); 
        }
        
        Some(Ok(vec![]))
    }
}