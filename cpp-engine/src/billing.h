
#pragma once
#include <string>
#include "meter.h"

struct BillBreakdown {
    std::string tenantId;
    double storageCost;
    double apiCallsCost;
    double bandwidthCost;
    double totalCost;
    std::string currency = "USD";
};

// Pricing tiers
struct PricingConfig {
    // Storage: per GB per month
    double storagePricePerGB    = 0.023;

    // API calls: per 10,000 calls
    double apiCallsPricePer10k  = 0.004;

    // Bandwidth: per GB
    double bandwidthPricePerGB  = 0.09;
};

class BillingCalculator {
public:
    BillingCalculator();
    BillingCalculator(const PricingConfig& config);

    BillBreakdown calculateBill(const UsageRecord& usage);
    void setPricing(const PricingConfig& config);
    PricingConfig getPricing() const;

private:
    PricingConfig pricing;
};