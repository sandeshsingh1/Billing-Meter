#include "billing.h"
#include <cmath>

BillingCalculator::BillingCalculator() : pricing(PricingConfig{}) {}

BillingCalculator::BillingCalculator(const PricingConfig& config) 
    : pricing(config) {}

BillBreakdown BillingCalculator::calculateBill(const UsageRecord& usage) {
    BillBreakdown bill;
    bill.tenantId = usage.tenantId;

    // Storage cost
    bill.storageCost = usage.storageGB * pricing.storagePricePerGB;

    // API calls cost (per 10k calls)
    bill.apiCallsCost = (usage.apiCalls / 10000.0) * pricing.apiCallsPricePer10k;

    // Bandwidth cost
    bill.bandwidthCost = usage.bandwidthGB * pricing.bandwidthPricePerGB;

    // Total — round to 2 decimal places
    double total = bill.storageCost + bill.apiCallsCost + bill.bandwidthCost;
    bill.totalCost = std::round(total * 100.0) / 100.0;

    return bill;
}

void BillingCalculator::setPricing(const PricingConfig& config) {
    pricing = config;
}

PricingConfig BillingCalculator::getPricing() const {
    return pricing;
}