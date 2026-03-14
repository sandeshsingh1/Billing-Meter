#include <gtest/gtest.h>
#include "../src/meter.h"
#include "../src/meter.cpp"
#include "../src/billing.h"
#include "../src/billing.cpp"

// ─────────────────────────────────────
// TEST 1: Basic usage recording
// ─────────────────────────────────────
TEST(MeteringEngineTest, RecordUsage) {
    MeteringEngine engine;
    
    UsageRecord record;
    record.tenantId    = "t001";
    record.storageGB   = 50.0;
    record.apiCalls    = 150000;
    record.bandwidthGB = 20.0;
    record.timestamp   = "2026-03-14";
    
    engine.recordUsage(record);
    
    UsageRecord result = engine.getUsage("t001");
    
    EXPECT_EQ(result.tenantId, "t001");
    EXPECT_DOUBLE_EQ(result.storageGB, 50.0);
    EXPECT_EQ(result.apiCalls, 150000);
    EXPECT_DOUBLE_EQ(result.bandwidthGB, 20.0);
}

// ─────────────────────────────────────
// TEST 2: Usage accumulation
// Multiple usage records add hone chahiye
// ─────────────────────────────────────
TEST(MeteringEngineTest, AccumulateUsage) {
    MeteringEngine engine;
    
    // Pehli reading
    UsageRecord record1;
    record1.tenantId    = "t002";
    record1.storageGB   = 30.0;
    record1.apiCalls    = 50000;
    record1.bandwidthGB = 10.0;
    record1.timestamp   = "2026-03-14";
    engine.recordUsage(record1);
    
    // Doosri reading — add honi chahiye
    UsageRecord record2;
    record2.tenantId    = "t002";
    record2.storageGB   = 20.0;
    record2.apiCalls    = 50000;
    record2.bandwidthGB = 10.0;
    record2.timestamp   = "2026-03-15";
    engine.recordUsage(record2);
    
    UsageRecord result = engine.getUsage("t002");
    
    // 30 + 20 = 50
    EXPECT_DOUBLE_EQ(result.storageGB, 50.0);
    // 50000 + 50000 = 100000
    EXPECT_EQ(result.apiCalls, 100000);
    // 10 + 10 = 20
    EXPECT_DOUBLE_EQ(result.bandwidthGB, 20.0);
}

// ─────────────────────────────────────
// TEST 3: Tenant not found
// ─────────────────────────────────────
TEST(MeteringEngineTest, TenantNotFound) {
    MeteringEngine engine;
    
    // Ye exception throw karni chahiye
    EXPECT_THROW(
        engine.getUsage("nonexistent"),
        std::runtime_error
    );
}

// ─────────────────────────────────────
// TEST 4: Reset usage
// ─────────────────────────────────────
TEST(MeteringEngineTest, ResetUsage) {
    MeteringEngine engine;
    
    UsageRecord record;
    record.tenantId    = "t003";
    record.storageGB   = 50.0;
    record.apiCalls    = 100000;
    record.bandwidthGB = 20.0;
    record.timestamp   = "2026-03-14";
    engine.recordUsage(record);
    
    // Reset karo
    engine.resetUsage("t003");
    
    // Ab exception aani chahiye
    EXPECT_THROW(
        engine.getUsage("t003"),
        std::runtime_error
    );
}

// ─────────────────────────────────────
// TEST 5: Bill calculation
// ─────────────────────────────────────
TEST(BillingCalculatorTest, CalculateBill) {
    BillingCalculator calculator;
    
    UsageRecord usage;
    usage.tenantId    = "t001";
    usage.storageGB   = 50.0;
    usage.apiCalls    = 150000;
    usage.bandwidthGB = 20.0;
    
    BillBreakdown bill = calculator.calculateBill(usage);
    
    // 50 × 0.023 = 1.15
    EXPECT_DOUBLE_EQ(bill.storageCost, 1.15);
    // (150000/10000) × 0.004 = 0.06
    EXPECT_DOUBLE_EQ(bill.apiCallsCost, 0.06);
    // 20 × 0.09 = 1.80
    EXPECT_DOUBLE_EQ(bill.bandwidthCost, 1.8);
    // Total = 3.01
    EXPECT_DOUBLE_EQ(bill.totalCost, 3.01);
}

// ─────────────────────────────────────
// TEST 6: Zero usage — bill zero hona chahiye
// ─────────────────────────────────────
TEST(BillingCalculatorTest, ZeroUsage) {
    BillingCalculator calculator;
    
    UsageRecord usage;
    usage.tenantId    = "t004";
    usage.storageGB   = 0.0;
    usage.apiCalls    = 0;
    usage.bandwidthGB = 0.0;
    
    BillBreakdown bill = calculator.calculateBill(usage);
    
    EXPECT_DOUBLE_EQ(bill.totalCost, 0.0);
}

// ─────────────────────────────────────
// TEST 7: Custom pricing
// ─────────────────────────────────────
TEST(BillingCalculatorTest, CustomPricing) {
    PricingConfig config;
    config.storagePricePerGB    = 0.05;  // custom price
    config.apiCallsPricePer10k  = 0.01;
    config.bandwidthPricePerGB  = 0.10;
    
    BillingCalculator calculator(config);
    
    UsageRecord usage;
    usage.tenantId    = "t005";
    usage.storageGB   = 10.0;
    usage.apiCalls    = 10000;
    usage.bandwidthGB = 10.0;
    
    BillBreakdown bill = calculator.calculateBill(usage);
    
    // 10 × 0.05 = 0.50
    EXPECT_DOUBLE_EQ(bill.storageCost, 0.5);
    // (10000/10000) × 0.01 = 0.01
    EXPECT_DOUBLE_EQ(bill.apiCallsCost, 0.01);
    // 10 × 0.10 = 1.00
    EXPECT_DOUBLE_EQ(bill.bandwidthCost, 1.0);
}

// ─────────────────────────────────────
// MAIN — tests run karo
// ─────────────────────────────────────
int main(int argc, char **argv) {
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}